import {
  Icon,
  Menu,
  Morph,
  cx,
  durations,
  easingCurves,
  hasContent,
  opensElsewhere,
  useButteryTransition,
  useMotionPreference,
  useStoredState,
} from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { ChevronDown, Clock } from "lucide-react";
import { motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
} from "react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  Context,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { Tooltip } from "../../components/tooltip/Tooltip.tsx";
import { useAppShell } from "../app-shell/app-shell-context.ts";

/** A page the sidebar remembers having shown. */
interface RecentPage {
  readonly label: string;
  readonly href: string;
}

interface Remembered {
  readonly open: Readonly<Record<string, boolean>>;
  readonly recent: readonly RecentPage[];
}

const STORAGE_PREFIX = "buttery:sidebar:";
const RECENT_LIMIT = 4;
const FORGOTTEN: Remembered = { open: {}, recent: [] };

function isRecentPage(value: unknown): value is RecentPage {
  return (
    typeof value === "object" &&
    value !== null &&
    "label" in value &&
    "href" in value &&
    typeof value.label === "string" &&
    typeof value.href === "string"
  );
}

function isRemembered(value: unknown): value is Remembered {
  if (typeof value !== "object" || value === null) return false;
  if (!("open" in value) || !("recent" in value)) return false;
  const { open, recent } = value;
  return (
    typeof open === "object" &&
    open !== null &&
    Object.values(open).every((flag) => typeof flag === "boolean") &&
    Array.isArray(recent) &&
    recent.every(isRecentPage)
  );
}

interface SidebarState {
  readonly mode: "full" | "rail";
  readonly navigate: (
    href: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  readonly recent: readonly RecentPage[];
  readonly visit: (page: RecentPage) => void;
  readonly isOpen: (group: string) => boolean | undefined;
  readonly setOpen: (group: string, open: boolean) => void;
}

const SidebarContext: Context<SidebarState | null> =
  createContext<SidebarState | null>(null);

/** Where an item sits: at the top of the nav, inside a group that folds, or in a rail's flyout menu. */
type Placement = "top" | "group" | "flyout";

const PlacementContext: Context<Placement> = createContext<Placement>("top");

function useSidebar(part: string): SidebarState {
  const sidebar = use(SidebarContext);
  if (!sidebar) {
    throw new Error(
      `[buttery:Sidebar] Sidebar.${part} has to be inside a <Sidebar>. Fix: <Sidebar label="Main"><Sidebar.Item label="Home" href="/" /></Sidebar>`,
    );
  }
  return sidebar;
}

/**
 * How the `Sidebar` around a component shows: `"full"`, or `"rail"` while the shell has made it an icon
 * rail; `undefined` outside a sidebar. A workspace switcher reads it to show its tile alone in a rail.
 */
export function useSidebarMode(): SidebarState["mode"] | undefined {
  return use(SidebarContext)?.mode;
}

function Glyph({ label }: { readonly label: string }): ReactElement {
  return (
    <span data-bt-part="glyph" aria-hidden="true">
      {Array.from(label)[0]?.toLocaleUpperCase() ?? ""}
    </span>
  );
}

/** Props for `Sidebar`. */
export interface SidebarProps extends Omit<
  ComponentPropsWithRef<"nav">,
  "aria-label"
> {
  /** Names the navigation for screen readers. Defaults to `"Main"`. */
  readonly label?: string | undefined;
  /** The workspace switcher at the top, such as an `AccountMenu`. */
  readonly switcher?: ReactNode;
  /** Remembers in local storage which groups are open and the pages visited lately, under this key. */
  readonly storageKey?: string | undefined;
  /**
   * Called when an item is chosen, with its `href`, unless the click opens a new tab. A router takes over
   * here: call `event.preventDefault()` and go to `href`.
   */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

function SidebarRoot({
  label = "Main",
  switcher,
  storageKey,
  onNavigate,
  className,
  children,
  ...rest
}: SidebarProps): ReactElement | null {
  const shell = useAppShell();
  const mode = shell.sidebar === "rail" ? "rail" : "full";
  const [stored, setStored] = useStoredState(
    storageKey === undefined ? undefined : `${STORAGE_PREFIX}${storageKey}`,
    FORGOTTEN,
    isRemembered,
  );
  const kept = storageKey === undefined ? shell.sidebarMemory : undefined;
  const memory =
    kept === undefined
      ? stored
      : isRemembered(kept.value)
        ? kept.value
        : FORGOTTEN;
  const keep = kept?.update;
  const setMemory = useCallback(
    (next: (current: Remembered) => Remembered) => {
      if (keep === undefined) {
        setStored(next);
        return;
      }
      keep((current) => next(isRemembered(current) ? current : FORGOTTEN));
    },
    [keep, setStored],
  );

  const visit = useCallback(
    (page: RecentPage) => {
      setMemory((current) =>
        current.recent[0]?.href === page.href
          ? current
          : {
              ...current,
              recent: [
                page,
                ...current.recent.filter((seen) => seen.href !== page.href),
              ].slice(0, RECENT_LIMIT),
            },
      );
    },
    [setMemory],
  );

  const state: SidebarState = {
    mode,
    navigate: (href, event) => {
      onNavigate?.(href, event);
    },
    recent: memory.recent,
    visit,
    isOpen: (group) => memory.open[group],
    setOpen: (group, open) => {
      setMemory((current) => ({
        ...current,
        open: { ...current.open, [group]: open },
      }));
    },
  };

  const hidden = shell.sidebar === "sheet";
  const unseen = hidden ? groupPageIn(children) : undefined;
  const unseenLabel = unseen?.label;
  const unseenHref = unseen?.href;

  useEffect(() => {
    if (unseenLabel === undefined || unseenHref === undefined) return;
    visit({ label: unseenLabel, href: unseenHref });
  }, [unseenLabel, unseenHref, visit]);

  // Under 640px the shell keeps this copy mounted out of sight only so Recent sees the page change; drawn,
  // its menus and shortcuts would go on working behind the sheet.
  if (hidden) return null;

  return (
    <SidebarContext value={state}>
      <nav
        aria-label={label}
        {...rest}
        className={cx("bt-sidebar", className)}
        data-bt="Sidebar"
        data-mode={mode}
      >
        {hasContent(switcher) ? (
          <div data-bt-part="switcher">{switcher}</div>
        ) : null}
        <div data-bt-part="nav" className="bt-scroll-fade">
          {children}
        </div>
      </nav>
    </SidebarContext>
  );
}

/** Props for `Sidebar.Item`. */
export interface SidebarItemProps extends Omit<
  ComponentPropsWithRef<"a">,
  "children" | "href"
> {
  /** The page's name. In a rail it's the item's tooltip and name. */
  readonly label: string;
  /** Where it goes. */
  readonly href: string;
  /** A 16px icon before the label. Items at the top of the nav have one; items in a group don't show it. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Whether it's the page shown. */
  readonly current?: boolean | undefined;
}

/**
 * One page: a 28px row with its icon and its label, `bg-control` and `text-strong` while it's the page
 * shown (`aria-current="page"`). In a rail it's its icon alone, named by a tooltip; in a group's flyout,
 * a menu item.
 */
export function SidebarItem({
  label,
  href,
  icon,
  current = false,
  className,
  onClick,
  ...rest
}: SidebarItemProps): ReactElement {
  const sidebar = useSidebar("Item");
  const placement = use(PlacementContext);
  const visit = sidebar.visit;

  useEffect(() => {
    if (current && placement !== "top") visit({ label, href });
  }, [current, placement, label, href, visit]);

  const choose = (event: MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(event);
    if (event.defaultPrevented || opensElsewhere(event)) return;
    sidebar.navigate(href, event);
  };

  if (placement === "flyout") {
    return (
      <Menu.Link
        {...rest}
        href={href}
        icon={icon}
        aria-current={current ? "page" : undefined}
        onClick={choose}
      >
        {label}
      </Menu.Link>
    );
  }

  const rail = sidebar.mode === "rail" && placement === "top";
  const link = (
    <a
      {...rest}
      href={href}
      aria-current={current ? "page" : undefined}
      className={cx("bt-sidebar-item bt-focus", className)}
      data-bt-part="item"
      onClick={choose}
    >
      {placement !== "top" ? null : icon ? (
        <Icon icon={icon} />
      ) : rail ? (
        <Glyph label={label} />
      ) : null}
      {rail ? (
        <VisuallyHidden.Root>{label}</VisuallyHidden.Root>
      ) : (
        <span
          className="bt-text bt-truncate"
          data-role="menu"
          data-bt-truncate=""
          title={label}
          data-bt-part="label"
        >
          {label}
        </span>
      )}
    </a>
  );
  return rail ? (
    <Tooltip label={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

/** Props for `Sidebar.Section`. */
export interface SidebarSectionProps extends ComponentPropsWithRef<"div"> {
  /** The section's heading, which names it. */
  readonly title: string;
}

/** A titled run of items, 12px under what's above it. In a rail its heading becomes a 1px divider. */
export function SidebarSection({
  title,
  className,
  children,
  ...rest
}: SidebarSectionProps): ReactElement {
  const sidebar = useSidebar("Section");
  const id = useId();
  const rail = sidebar.mode === "rail";
  return (
    <div
      role="group"
      {...(rail ? { "aria-label": title } : { "aria-labelledby": id })}
      {...rest}
      className={cx("bt-sidebar-section", className)}
      data-bt-part="sidebar-section"
    >
      {rail ? (
        <span data-bt-part="sidebar-divider" aria-hidden="true" />
      ) : (
        <div
          id={id}
          className="bt-text bt-truncate"
          data-role="caption"
          data-bt-truncate=""
          title={title}
          data-bt-part="sidebar-section-title"
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/** Props for `Sidebar.Group`. */
export interface SidebarGroupProps {
  /** The group's name, on its header. In a rail it's the header's tooltip and name. */
  readonly label: string;
  /** A 16px icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Whether it starts open. Defaults to whether it holds the page shown; once someone opens or closes it, the sidebar remembers. */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Its items, `Sidebar.Item`s. Written straight in the group (or in fragments), they count for Recent, the
   * rail's current mark and opening by default even while the group is closed; an item wrapped in a
   * component of your own counts once it's shown.
   */
  readonly children?: ReactNode;
}

interface ItemLikeProps {
  readonly current?: unknown;
  readonly label?: unknown;
  readonly href?: unknown;
  readonly children?: ReactNode;
}

/** The page shown among a group's items, read from their props, so it's known while the group is closed. */
function shownPage(children: ReactNode): RecentPage | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<ItemLikeProps>(child)) continue;
    const { current, label, href } = child.props;
    if (child.type === Fragment) {
      const page = shownPage(child.props.children);
      if (page) return page;
    } else if (
      current === true &&
      typeof label === "string" &&
      typeof href === "string"
    ) {
      return { label, href };
    }
  }
  return undefined;
}

/** The page shown inside one of the nav's groups, read from props, for a sidebar the shell isn't drawing. */
function groupPageIn(children: ReactNode): RecentPage | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<ItemLikeProps>(child)) continue;
    const page =
      child.type === SidebarGroup
        ? shownPage(child.props.children)
        : child.type === Fragment || child.type === SidebarSection
          ? groupPageIn(child.props.children)
          : undefined;
    if (page) return page;
  }
  return undefined;
}

const closeChevron = {
  duration: durations.fast / 1000,
  ease: easingCurves.standard,
};

/**
 * A group of items under a header that folds and unfolds: its height opens on `spring.snappy` and closes
 * over `dur-fast` while its chevron turns. Its items sit under the header's label, without icons. In a rail,
 * the header opens its items in a flyout menu beside it, and shows the current state while one of them is
 * the page shown.
 */
export function SidebarGroup({
  label,
  icon,
  defaultOpen,
  children,
}: SidebarGroupProps): ReactElement {
  const sidebar = useSidebar("Group");
  const reduced = useMotionPreference() === "reduced";
  const openTurn = useButteryTransition("snappy");
  const id = useId();
  const shown = shownPage(children);
  const open = sidebar.isOpen(label) ?? defaultOpen ?? shown !== undefined;
  const shownLabel = shown?.label;
  const shownHref = shown?.href;
  const visit = sidebar.visit;

  useEffect(() => {
    if (shownLabel === undefined || shownHref === undefined) return;
    visit({ label: shownLabel, href: shownHref });
  }, [shownLabel, shownHref, visit]);

  if (sidebar.mode === "rail") {
    return (
      <Menu>
        <Tooltip label={label} side="right">
          <Menu.Trigger asChild>
            <button
              type="button"
              aria-label={label}
              className="bt-sidebar-item bt-focus"
              data-bt-part="item"
              aria-current={shown === undefined ? undefined : "true"}
            >
              {icon ? <Icon icon={icon} /> : <Glyph label={label} />}
            </button>
          </Menu.Trigger>
        </Tooltip>
        <Menu.Content side="right" align="start" aria-label={label}>
          <PlacementContext value="flyout">{children}</PlacementContext>
        </Menu.Content>
      </Menu>
    );
  }

  return (
    <div
      className="bt-sidebar-group"
      data-bt-part="group"
      data-icon={icon ? "" : undefined}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        className="bt-sidebar-item bt-focus"
        data-bt-part="item"
        onClick={() => {
          sidebar.setOpen(label, !open);
        }}
      >
        {icon ? <Icon icon={icon} /> : null}
        <span
          className="bt-text bt-truncate"
          data-role="menu"
          data-bt-truncate=""
          title={label}
          data-bt-part="label"
        >
          {label}
        </span>
        <motion.span
          data-bt-part="chevron"
          initial={false}
          animate={{
            rotate: open ? 180 : 0,
            transition: open || reduced ? openTurn : closeChevron,
          }}
        >
          <Icon icon={ChevronDown} />
        </motion.span>
      </button>
      <Morph id={id} disclosure contentKey={open ? "open" : "closed"}>
        {open ? (
          <div role="group" aria-label={label} data-bt-part="group-items">
            <PlacementContext value="group">{children}</PlacementContext>
          </div>
        ) : null}
      </Morph>
    </div>
  );
}

/** Props for `Sidebar.Recent`. */
export interface SidebarRecentProps {
  /** The section's heading. Defaults to `"Recent"`. */
  readonly title?: string | undefined;
}

/**
 * The pages visited lately that live inside groups, newest first, the last four, each with a clock icon.
 * It fills itself as people move around, from closed groups and a rail's flyouts too, and stays empty
 * until then; with the sidebar's `storageKey` it remembers them across visits. A rail leaves it out,
 * since its clock icons would all look alike.
 */
export function SidebarRecent({
  title = "Recent",
}: SidebarRecentProps): ReactElement | null {
  const sidebar = useSidebar("Recent");
  if (sidebar.recent.length === 0 || sidebar.mode === "rail") return null;
  return (
    <SidebarSection title={title}>
      {sidebar.recent.map((page) => (
        <SidebarItem
          key={page.href}
          label={page.label}
          href={page.href}
          icon={Clock}
        />
      ))}
    </SidebarSection>
  );
}

/** `Sidebar` with its parts. */
export interface SidebarComponent {
  (props: SidebarProps): ReactElement | null;
  /** One page. */
  readonly Item: typeof SidebarItem;
  /** A titled run of items. */
  readonly Section: typeof SidebarSection;
  /** A group of items that folds. */
  readonly Group: typeof SidebarGroup;
  /** The pages visited lately. */
  readonly Recent: typeof SidebarRecent;
}

/**
 * An app's navigation down the side, 240px wide in an `AppShell layout="sidebar"`, padding 12: a workspace
 * switcher at the top, then items 2px apart, titled sections, groups that fold (open ones remembered with
 * `storageKey`), an automatic Recent section and, by convention, a More group at the end. The switcher
 * stays put, lined up with the top bar, while the nav scrolls under it. Under 1100px of shell it becomes a
 * 56px icon rail with tooltips, its section headings dividers and its groups flyout menus; under 640 the
 * shell opens it as a sheet. `onNavigate` lets a router take over every item.
 *
 * @example
 * <Sidebar label="Main" switcher={<AccountMenu workspace="Northside Roasters">…</AccountMenu>} storageKey="dashboard">
 *   <Sidebar.Item icon={House} label="Home" href="/" current />
 *   <Sidebar.Item icon={Receipt} label="Orders" href="/orders" />
 *   <Sidebar.Recent />
 *   <Sidebar.Group icon={ChartLine} label="Reports">
 *     <Sidebar.Item label="Revenue" href="/reports/revenue" />
 *   </Sidebar.Group>
 * </Sidebar>
 */
export const Sidebar: SidebarComponent = Object.assign(SidebarRoot, {
  Item: SidebarItem,
  Section: SidebarSection,
  Group: SidebarGroup,
  Recent: SidebarRecent,
});
