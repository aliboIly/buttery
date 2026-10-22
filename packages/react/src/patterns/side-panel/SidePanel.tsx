import {
  Layer,
  Menu,
  Scrim,
  cx,
  hasContent,
  presencePresets,
  reducedPresence,
  tabbables,
  takesText,
  useAnimationTracking,
  useCloseFocus,
  useControllableState,
  useFloatingObstacle,
  useMergedRefs,
  useMotionPreference,
} from "@buttery/core";
import type { MotionElementProps } from "@buttery/core";
import { Ellipsis, Maximize2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { useAppShell } from "../app-shell/app-shell-context.ts";

/** Props for `SidePanel`. */
export interface SidePanelProps extends Omit<
  MotionElementProps<"aside">,
  "title" | "children"
> {
  /** Its title, an `h2` in `title-sm`, which names it, such as "Help". */
  readonly title: string;
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes, from its close button, Escape or its sheet's scrim. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Its overflow menu's items, `Menu.Item`s and `Menu.Link`s, an item that deletes or resets something with
   * `tone="danger"`. Leave it out for no menu.
   */
  readonly menu?: ReactNode;
  /** Names the overflow menu's button. Defaults to `"More actions"`. */
  readonly menuLabel?: string | undefined;
  /** Whether a docked panel is widened to 560px. Pair with `onExpandedChange` to control it. */
  readonly expanded?: boolean | undefined;
  /** Whether a docked panel starts widened when uncontrolled. Defaults to `false`. */
  readonly defaultExpanded?: boolean | undefined;
  /** Called when its expand button widens or narrows it. */
  readonly onExpandedChange?: ((expanded: boolean) => void) | undefined;
  /** Names the expand button, a toggle that's pressed while the panel is widened. Defaults to `"Expand"`. */
  readonly expandLabel?: string | undefined;
  /** What stays pinned under the body while it scrolls, such as a field to ask a question in. */
  readonly footer?: ReactNode;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** What the panel holds. It scrolls on its own. */
  readonly children?: ReactNode;
}

interface PanelPartsProps {
  readonly title: ReactNode;
  readonly menu: ReactNode;
  readonly menuLabel: string;
  readonly expandButton: ReactNode;
  readonly closeButton: ReactNode;
  readonly footer: ReactNode;
  readonly children: ReactNode;
}

function PanelParts({
  title,
  menu,
  menuLabel,
  expandButton,
  closeButton,
  footer,
  children,
}: PanelPartsProps): ReactElement {
  return (
    <>
      <div data-bt-part="header">
        {title}
        <div data-bt-part="side-panel-actions">
          {hasContent(menu) ? (
            <Menu>
              <Menu.Trigger asChild>
                <IconButton icon={Ellipsis} label={menuLabel} size="sm" />
              </Menu.Trigger>
              <Menu.Content aria-label={menuLabel}>{menu}</Menu.Content>
            </Menu>
          ) : null}
          {expandButton}
          {closeButton}
        </div>
      </div>
      <div data-bt-part="content">
        <div data-bt-part="side-panel-body">{children}</div>
        {hasContent(footer) ? (
          <div data-bt-part="side-panel-footer">{footer}</div>
        ) : null}
      </div>
    </>
  );
}

/**
 * A panel at the end of an `AppShell layout="sidebar"`, such as help: from 1280px of shell it docks beside
 * the column, full height, 360px wide (560 expanded), and the page takes the rest of the width in the same
 * frame instead of being covered; under that it opens as a sheet at the window's end over a dim scrim. A
 * docked panel closes when the shell narrows under 1280px, and an open sheet docks as it widens; crossing
 * that width mounts what it holds again, so keep state there above it. Its header holds its title, an
 * overflow menu, an expand button (docked only) and a close button; its body scrolls above a pinned
 * `footer`; floating lanes, such as a setup guide's, keep to the page's side of a docked panel. A docked
 * panel appears in one frame and its content fades in over `dur-fast`; the sheet rises as the sidebar's
 * does. Opening it moves focus to its first field to type in, else to the panel itself; Escape or the close
 * button closes it and hands focus back to what opened it. Outside a shell it docks where it's placed.
 *
 * @example
 * <AppShell
 *   layout="sidebar"
 *   sidebar={<Sidebar label="Main">…</Sidebar>}
 *   topBar={<TopBar actions={<TopBar.Action icon={CircleHelp} label="Help" expanded={help} onSelect={() => setHelp(!help)} />} />}
 *   panel={<SidePanel title="Help" open={help} onOpenChange={setHelp}>…</SidePanel>}
 * >
 *   <AppPage header={<PageHeader title="Orders" />}>…</AppPage>
 * </AppShell>
 */
export function SidePanel({
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  menu,
  menuLabel = "More actions",
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  expandLabel = "Expand",
  footer,
  closeLabel = "Close",
  className,
  children,
  ref,
  ...rest
}: SidePanelProps): ReactElement | null {
  const shell = useAppShell();
  const docked = shell.panel === "docked";
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [isExpanded, setExpanded] = useControllableState({
    value: expanded,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  });
  const dock = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const obstacle = useFloatingObstacle();
  const dockedRefs = useMergedRefs(useMergedRefs(ref, dock), obstacle);
  const sheetRefs = useMergedRefs(ref, sheet);
  const titleId = useId();
  const dockCloseFocus = useCloseFocus(isOpen, dock);
  const sheetCloseFocus = useCloseFocus(isOpen, sheet);

  // A docked panel closes when the shell narrows under it rather than turning into a modal sheet.
  const [seenDocked, setSeenDocked] = useState<boolean | undefined>(
    shell.measured ? docked : undefined,
  );
  const [narrowed, setNarrowed] = useState(false);
  if (shell.measured && seenDocked !== docked) {
    setSeenDocked(docked);
    setNarrowed(seenDocked === true && !docked && isOpen);
  }
  if (narrowed && !isOpen) setNarrowed(false);
  const hidden = !shell.measured || narrowed;
  const closeNarrowed = useEffectEvent(() => {
    setOpen(false);
  });
  useEffect(() => {
    if (narrowed && isOpen) closeNarrowed();
  }, [narrowed, isOpen]);

  const showing = {
    open: isOpen,
    docked: !hidden && docked && isOpen,
    sheet: !hidden && !docked && isOpen,
  };
  const shown = useRef(showing);
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const rise = reduced ? reducedPresence : presencePresets.rise;
  const fade = reduced ? reducedPresence : presencePresets.fade;

  // The sheet's focus is Radix's. A docked panel moves focus in as it opens or takes over from the sheet as
  // the shell widens, but not when it's open from the start; it hands focus back as it closes or narrows away.
  useLayoutEffect(() => {
    const before = shown.current;
    shown.current = showing;
    if (showing.docked && !before.docked) {
      if (before.open && !before.sheet) return;
      const panel = dock.current;
      const [field] = tabbables(panel).filter(takesText);
      (field ?? panel)?.focus();
      return;
    }
    if (!showing.docked && before.docked) dockCloseFocus(new Event("close"));
  });

  const close = (): void => {
    setOpen(false);
  };

  const parts = {
    menu,
    menuLabel,
    footer,
    children,
  };

  if (hidden) return null;

  if (docked) {
    if (!isOpen) return null;
    return (
      <motion.aside
        aria-labelledby={titleId}
        tabIndex={-1}
        {...rest}
        ref={dockedRefs}
        className={cx("bt-side-panel", className)}
        data-bt="SidePanel"
        data-mode="docked"
        data-expanded={isExpanded ? "" : undefined}
        data-bt-region=""
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          rest.onKeyDown?.(event);
          if (event.key !== "Escape" || event.defaultPrevented) return;
          if (
            !(event.target instanceof Node) ||
            !event.currentTarget.contains(event.target)
          )
            return;
          event.preventDefault();
          close();
        }}
      >
        <PanelParts
          {...parts}
          title={
            <h2
              id={titleId}
              className="bt-text bt-truncate"
              data-role="title-sm"
              data-bt-truncate=""
              title={title}
              data-bt-part="side-panel-title"
            >
              {title}
            </h2>
          }
          expandButton={
            <IconButton
              icon={Maximize2}
              label={expandLabel}
              size="sm"
              aria-pressed={isExpanded}
              onClick={() => {
                setExpanded(!isExpanded);
              }}
            />
          }
          closeButton={
            <IconButton icon={X} label={closeLabel} size="sm" onClick={close} />
          }
        />
      </motion.aside>
    );
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <AnimatePresence>
        {isOpen ? (
          <Layer band="modal" key="side-panel">
            <Dialog.Overlay forceMount asChild>
              <motion.div
                initial={fade.initial}
                animate={fade.animate}
                exit={fade.exit}
                className="bt-side-panel-scrim"
                data-bt-part="scrim"
              >
                <Scrim />
              </motion.div>
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                const [field] = tabbables(sheet.current).filter(takesText);
                (field ?? sheet.current)?.focus();
              }}
              onCloseAutoFocus={sheetCloseFocus}
            >
              <motion.div
                {...rest}
                {...tracking}
                ref={sheetRefs}
                initial={rise.initial}
                animate={rise.animate}
                exit={rise.exit}
                tabIndex={-1}
                className={cx("bt-side-panel bt-surface", className)}
                data-level="floating"
                data-bt="SidePanel"
                data-mode="sheet"
                data-bt-part="sheet"
                data-bt-region=""
              >
                <PanelParts
                  {...parts}
                  title={
                    <Dialog.Title asChild>
                      <h2
                        className="bt-text bt-truncate"
                        data-role="title-sm"
                        data-bt-truncate=""
                        title={title}
                        data-bt-part="side-panel-title"
                      >
                        {title}
                      </h2>
                    </Dialog.Title>
                  }
                  expandButton={null}
                  closeButton={
                    <Dialog.Close asChild>
                      <IconButton icon={X} label={closeLabel} size="sm" />
                    </Dialog.Close>
                  }
                />
              </motion.div>
            </Dialog.Content>
          </Layer>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
