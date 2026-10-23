import {
  FloatingEntranceContext,
  Layer,
  Scrim,
  cx,
  hasContent,
  opensElsewhere,
  presencePresets,
  reducedPresence,
  tabbables,
  useAnimationTracking,
  useCloseFocus,
  useControllableState,
  useFloatingObstacle,
  useMergedRefs,
  useMotionPreference,
  warnOnce,
} from "@butteryui/core";
import type { CloseFocusFallback } from "@butteryui/core";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { flushSync } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { AppShellContext } from "./app-shell-context.ts";
import type {
  AppShellState,
  PanelMode,
  SidebarMemory,
  SidebarMode,
} from "./app-shell-context.ts";

/** Props for `AppShell` in its editor layout: a work area with an inspector beside it. */
export interface AppShellInspectorProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** `"inspector"` (the default) for an editor: the work area with an inspector beside it. */
  readonly layout?: "inspector" | undefined;
  /** The bar at the top of the work area, such as a `HeaderBar`. */
  readonly header: ReactNode;
  /** The settings beside the work area, such as an `Inspector`. On narrow screens it opens as a sheet. */
  readonly inspector: ReactNode;
  /** Names the inspector's sheet on narrow screens, such as "Gift card settings". */
  readonly inspectorLabel: string;
  /** The button that opens the sheet on narrow screens. Defaults to `"Edit"`. */
  readonly openInspectorLabel?: string | undefined;
  /** Whether the inspector's sheet is open on a narrow screen. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the sheet starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the sheet opens or closes, including when the screen widens and the inspector moves back beside the stage. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The work area, such as a `Stage`. */
  readonly children: ReactNode;
}

/** Props for `AppShell` in its dashboard layout: a sidebar beside the top bar and the page. */
export interface AppShellSidebarProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** `"sidebar"` for a dashboard: a sidebar beside a column holding the top bar and the page. */
  readonly layout: "sidebar";
  /** The app's navigation, a `Sidebar`. It becomes an icon rail under 1100px of shell and a sheet under 640. */
  readonly sidebar: ReactNode;
  /** The bar over the page, a `TopBar`. */
  readonly topBar?: ReactNode;
  /**
   * A `SidePanel`, such as help, at the shell's end: docked beside the column from 1280px of shell, making
   * the page narrower, and a sheet under that.
   */
  readonly panel?: ReactNode;
  /** Names the sidebar's sheet on narrow screens. Defaults to `"Navigation"`. */
  readonly sidebarLabel?: string | undefined;
  /**
   * Names the button that is the first thing Tab reaches, shown only while it has focus, which moves focus
   * past the sidebar and the top bar to the page. Defaults to `"Skip to content"`.
   */
  readonly skipLabel?: string | undefined;
  /** Whether the sidebar's sheet is open on a narrow screen. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the sheet starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the sheet opens or closes, including when the shell widens and the sidebar comes back. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The page, an `AppPage`. */
  readonly children: ReactNode;
}

/** Props for `AppShell`: the editor layout (the default) or the dashboard layout with `layout="sidebar"`. */
export type AppShellProps = AppShellInspectorProps | AppShellSidebarProps;

/** Narrower than this, the inspector no longer fits beside a useful stage and opens as a sheet. */
const SHEET_BELOW = 840;

/** Narrower than this, the sidebar becomes an icon rail. */
const RAIL_BELOW = 1100;

/** Narrower than this, the sidebar leaves the shell and opens as a sheet from the top bar. */
const SIDEBAR_SHEET_BELOW = 640;

/** From this wide, a side panel docks beside the column; narrower, it opens as a sheet. */
const PANEL_DOCKS_FROM = 1280;

function Sheet({
  label,
  sheet,
  children,
}: {
  readonly label: string;
  readonly sheet: RefObject<HTMLDivElement | null>;
  readonly children: ReactNode;
}): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const preset = reduced ? reducedPresence : presencePresets.rise;
  const fade = reduced ? reducedPresence : presencePresets.fade;
  return (
    <Layer band="modal" key="sheet">
      <Dialog.Overlay forceMount asChild>
        <motion.div
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          className="bt-app-shell-scrim"
          data-bt-part="sheet-scrim"
        >
          <Scrim />
        </motion.div>
      </Dialog.Overlay>
      <Dialog.Content forceMount asChild aria-describedby={undefined}>
        <motion.div
          {...tracking}
          ref={sheet}
          initial={preset.initial}
          animate={preset.animate}
          exit={preset.exit}
          className="bt-app-shell-sheet"
          data-bt-part="sheet"
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>{label}</Dialog.Title>
          </VisuallyHidden.Root>
          {children}
        </motion.div>
      </Dialog.Content>
    </Layer>
  );
}

function InspectorShell({
  header,
  inspector,
  inspectorLabel,
  openInspectorLabel = "Edit",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ref,
  layout = "inspector",
  ...rest
}: AppShellInspectorProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const sheet = useRef<HTMLDivElement>(null);
  const inline = useRef<HTMLDivElement>(null);
  const obstacle = useFloatingObstacle();
  const inspectorRefs = useMergedRefs(inline, obstacle);
  const refocus = useRef(false);
  const [narrow, setNarrow] = useState(false);
  const [sheetOpen, setSheetOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const closeSheet = useRef(setSheetOpen);

  useLayoutEffect(() => {
    closeSheet.current = setSheetOpen;
  });

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const measure = (): void => {
      const isNarrow = element.clientWidth < SHEET_BELOW;
      if (!isNarrow) {
        if (sheet.current?.contains(document.activeElement) === true) {
          refocus.current = true;
        }
        closeSheet.current(false);
      }
      setNarrow(isNarrow);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (narrow || !refocus.current) return;
    refocus.current = false;
    inline.current
      ?.querySelector<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
  }, [narrow]);

  return (
    <div
      {...rest}
      ref={refs}
      className={cx("bt-app-shell", className)}
      data-bt="AppShell"
      data-layout={layout}
      data-narrow={narrow ? "" : undefined}
    >
      <div ref={obstacle} data-bt-part="header">
        {header}
      </div>
      <main data-bt-part="stage">{children}</main>
      {narrow ? (
        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <div ref={obstacle} data-bt-part="sheet-bar">
            <Dialog.Trigger asChild>
              <Button variant="primary" size="cta" shape="rounded">
                {openInspectorLabel}
              </Button>
            </Dialog.Trigger>
          </div>
          <AnimatePresence>
            {sheetOpen ? (
              <Sheet key="sheet" label={inspectorLabel} sheet={sheet}>
                {inspector}
              </Sheet>
            ) : null}
          </AnimatePresence>
        </Dialog.Root>
      ) : (
        <div ref={inspectorRefs} data-bt-part="inspector">
          {inspector}
        </div>
      )}
    </div>
  );
}

function SidebarSheet({
  label,
  close,
  inline,
  children,
}: {
  readonly label: string;
  readonly close: () => void;
  /** Where focus goes if the sheet closes because the shell widened and its menu button went away. */
  readonly inline: CloseFocusFallback;
  readonly children: ReactNode;
}): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const preset = reduced ? reducedPresence : presencePresets.rise;
  const scrim = reduced ? reducedPresence : presencePresets.fade;
  const panel = useRef<HTMLDivElement>(null);
  const closeFocus = useCloseFocus(true, panel, undefined, inline);
  return (
    <Layer band="modal" key="sidebar">
      <Dialog.Overlay forceMount asChild>
        <motion.div
          initial={scrim.initial}
          animate={scrim.animate}
          exit={scrim.exit}
          className="bt-app-shell-scrim"
          data-bt-part="sheet-scrim"
        >
          <Scrim />
        </motion.div>
      </Dialog.Overlay>
      <Dialog.Content
        forceMount
        asChild
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          const [first] = tabbables(panel.current);
          if (!first) return;
          event.preventDefault();
          first.focus();
        }}
        onCloseAutoFocus={closeFocus}
      >
        <motion.div
          {...tracking}
          ref={panel}
          initial={preset.initial}
          animate={preset.animate}
          exit={preset.exit}
          className="bt-app-shell-sidebar-sheet bt-surface"
          data-level="floating"
          data-bt-part="sidebar-sheet"
          onClickCapture={(event) => {
            if (opensElsewhere(event)) return;
            if (!(event.target instanceof Element)) return;
            if (!event.target.closest("a[href]")) return;
            close();
          }}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>{label}</Dialog.Title>
          </VisuallyHidden.Root>
          {children}
        </motion.div>
      </Dialog.Content>
    </Layer>
  );
}

interface ShellModes {
  readonly sidebar: SidebarMode;
  readonly panel: PanelMode;
  readonly measured: boolean;
}

function modesAt(width: number): ShellModes {
  return {
    sidebar:
      width >= RAIL_BELOW
        ? "full"
        : width >= SIDEBAR_SHEET_BELOW
          ? "rail"
          : "sheet",
    panel: width >= PANEL_DOCKS_FROM ? "docked" : "sheet",
    measured: true,
  };
}

function sameModes(first: ShellModes, second: ShellModes): boolean {
  return (
    first.sidebar === second.sidebar &&
    first.panel === second.panel &&
    first.measured === second.measured
  );
}

function SidebarShell({
  sidebar,
  topBar,
  panel,
  sidebarLabel = "Navigation",
  skipLabel = "Skip to content",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ref,
  layout,
  ...rest
}: AppShellSidebarProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const [modes, setModes] = useState<ShellModes>({
    sidebar: "full",
    panel: "docked",
    measured: false,
  });
  const shownModes = useRef(modes);
  const mode = modes.sidebar;
  const [sheetOpen, setSheetOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const closeSheet = useRef(setSheetOpen);
  const [remembered, setRemembered] = useState<unknown>(undefined);
  const sidebarMemory = useMemo<SidebarMemory>(
    () => ({ value: remembered, update: setRemembered }),
    [remembered],
  );
  const hasTopBar = hasContent(topBar);
  const controlled = open !== undefined;

  useLayoutEffect(() => {
    closeSheet.current = setSheetOpen;
    shownModes.current = modes;
  });

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const measure = (): void => {
      const next = modesAt(element.clientWidth);
      if (next.sidebar !== "sheet") closeSheet.current(false);
      setModes((current) => (sameModes(current, next) ? current : next));
    };
    measure();
    const observer = new ResizeObserver(() => {
      // A new mode paints in the frame the shell resized in, not a frame later.
      if (sameModes(modesAt(element.clientWidth), shownModes.current))
        measure();
      else flushSync(measure);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (hasTopBar || controlled) return;
    warnOnce(
      "AppShell",
      "A sidebar shell has no topBar, so under 640px nothing opens its sidebar. Fix: pass topBar={<TopBar … />}, or open the sheet yourself with open and onOpenChange.",
    );
  }, [hasTopBar, controlled]);

  const scrollPageToTop = useCallback(() => {
    page.current?.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const shell: AppShellState = {
    sidebar: mode,
    panel: modes.panel,
    measured: modes.measured,
    openSidebar: () => {
      setSheetOpen(true);
    },
    sidebarOpen: mode === "sheet" && sheetOpen,
    scrollPageToTop,
    sidebarMemory,
  };
  const inlineSidebar = (): HTMLElement | undefined => {
    const sidebar = root.current?.querySelector(
      ':scope > [data-bt-part="sidebar"]',
    );
    return (
      sidebar?.querySelector<HTMLElement>('[aria-current="page"]') ??
      tabbables(sidebar ?? null)[0]
    );
  };
  const inSheet: AppShellState = { ...shell, sidebar: "full" };

  return (
    <AppShellContext value={shell}>
      <FloatingEntranceContext value="instant">
        <div
          {...rest}
          ref={refs}
          className={cx("bt-app-shell", className)}
          data-bt="AppShell"
          data-layout={layout}
          data-sidebar={mode}
        >
          <button
            type="button"
            className="bt-focus"
            data-bt-part="skip"
            onClick={() => {
              page.current?.focus();
            }}
          >
            {skipLabel}
          </button>
          {/* Hidden under 640 rather than unmounted, so it still sees the page shown change for Recent. */}
          <div data-bt-part="sidebar" hidden={mode === "sheet"}>
            {sidebar}
          </div>
          <div data-bt-part="column">
            {hasTopBar ? <div data-bt-part="top">{topBar}</div> : null}
            <div
              ref={page}
              tabIndex={-1}
              data-bt-part="page"
              className="bt-scroll-fade"
            >
              {children}
            </div>
          </div>
          {hasContent(panel) ? <div data-bt-part="panel">{panel}</div> : null}
          {mode === "sheet" ? (
            <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
              <AnimatePresence>
                {sheetOpen ? (
                  <AppShellContext value={inSheet}>
                    <SidebarSheet
                      key="sidebar"
                      label={sidebarLabel}
                      inline={inlineSidebar}
                      close={() => {
                        setSheetOpen(false);
                      }}
                    >
                      {sidebar}
                    </SidebarSheet>
                  </AppShellContext>
                ) : null}
              </AnimatePresence>
            </Dialog.Root>
          ) : null}
        </div>
      </FloatingEntranceContext>
    </AppShellContext>
  );
}

/**
 * A whole app screen. The default layout is an editor inside the app's background: the header and the
 * stage in one column and the inspector, full height, beside them, at most 1380px wide and centered; under
 * 840px the inspector moves into a sheet that rises from the bottom, opened by a button under the stage.
 * Toasts and the other floating lanes keep clear of the header, the inspector and that button.
 *
 * `layout="sidebar"` is a dashboard: the sidebar beside a column holding the top bar and the page, each
 * scrolling on its own, the shell never scrolling. Measured on the shell's own width, the sidebar is full
 * from 1100px, an icon rail under that, and under 640 it leaves the shell and opens as a sheet from the top
 * bar's menu button, closing on navigation, Escape or the scrim. A `panel`, a `SidePanel`, docks at the
 * shell's end from 1280px, making the column narrower, and opens as a sheet under that. Menus and popovers
 * inside it arrive instantly, as app chrome does.
 *
 * @example
 * <AppShell header={<HeaderBar title="Gift card for Rosa" />} inspector={<Inspector label="Gift card settings">…</Inspector>} inspectorLabel="Gift card settings">
 *   <Stage label="Gift card preview" size={size}>…</Stage>
 * </AppShell>
 * <AppShell layout="sidebar" sidebar={<Sidebar label="Main">…</Sidebar>} topBar={<TopBar />}>
 *   <AppPage header={<PageHeader title="Orders" />}>…</AppPage>
 * </AppShell>
 */
export function AppShell(props: AppShellProps): ReactElement {
  return props.layout === "sidebar" ? (
    <SidebarShell {...props} />
  ) : (
    <InspectorShell {...props} />
  );
}
