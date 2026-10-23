import {
  Icon,
  Text,
  cx,
  durations,
  easingCurves,
  hasContent,
  lastInput,
  reducedTransition,
  space,
  spring,
  tabbables,
  timing,
  useButteryTransition,
  useAnimationTracking,
  useControllableState,
  useMotionPreference,
  widths,
} from "@butteryui/core";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, cancelFrame, frame, motion } from "motion/react";
import type { Process, Transition } from "motion/react";
import { Accordion, NavigationMenu as RadixNav } from "radix-ui";
import { flushSync } from "react-dom";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  PointerEvent,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";

/** How a `MorphMenu` lays out its menus: in a row sharing one panel, or stacked as sections that open in place. */
export type MorphMenuLayout = "bar" | "stack";

interface MenuState {
  readonly layout: MorphMenuLayout;
  readonly value: string;
  readonly register: (value: string, element: HTMLElement | null) => void;
  /** The pointer came onto the panel: whatever close was waiting stops. */
  readonly hold: (event: PointerEvent) => void;
  /** The pointer left the panel or a trigger: the open menu closes after the grace. */
  readonly release: (event: PointerEvent) => void;
  /** The pointer came onto a trigger. */
  readonly enter: (item: string, event: PointerEvent) => void;
  /** The pointer moved on a trigger: its menu opens, after the hover intent unless one was just open. */
  readonly point: (item: string, event: PointerEvent) => void;
  /** The pointer left a trigger. */
  readonly leave: (item: string, event: PointerEvent) => void;
}

const MenuContext = createContext<MenuState | null>(null);

function useMenu(part: string): MenuState {
  const state = use(MenuContext);
  if (!state) {
    throw new Error(
      `[buttery:MorphMenu] ${part} has to be inside a <MorphMenu>. Fix: <MorphMenu><MorphMenu.Item label="…">…</MorphMenu.Item></MorphMenu>`,
    );
  }
  return state;
}

const unfold: Transition = {
  duration: durations.fast / 1000,
  ease: easingCurves.out,
};

const fold: Transition = {
  duration: durations.fast / 1000,
  ease: easingCurves.in,
};

interface Geometry {
  readonly x: number;
  readonly width: number;
  readonly height: number;
  /** Whether the menu is taller than the room below the row, so the panel scrolls. */
  readonly capped: boolean;
  readonly first: boolean;
}

/** The least the panel shows below the row, however little room the window has left. */
const SHORTEST = widths["nav-panel-min"].value;

/** How far the panel stays inside the window's bottom edge, as every floating surface does. */
const GUTTER = space["2"];

/** The panel's own hold and release time the pointer, so Radix's close timer never starts from the menu. */
function keepRadixTimersOff(event: PointerEvent): void {
  event.preventDefault();
}

function sameGeometry(a: Geometry | null, b: Geometry): boolean {
  return (
    a !== null &&
    a.x === b.x &&
    a.width === b.width &&
    a.height === b.height &&
    a.capped === b.capped
  );
}

/**
 * The one floating card every menu opens in, 8px under the row of triggers: the open menu's size, centered
 * under its trigger and kept inside the row. A strip that draws nothing runs from the row's top, under the
 * row, down to the card; it fills the 8px gap, so the pointer going down from a trigger's full-height target
 * reaches the card without leaving the menu.
 */
function MorphPanel({
  value,
  triggers,
  panel,
}: {
  readonly value: string;
  readonly triggers: RefObject<Map<string, HTMLElement>>;
  readonly panel: RefObject<HTMLDivElement | null>;
}): ReactElement {
  const menu = useMenu("MorphMenu");
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const viewport = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const placed = useRef(false);
  const open = value !== "";

  useLayoutEffect(() => {
    if (!open) return undefined;
    const view = viewport.current;
    const measure = (): void => {
      const box = panel.current?.offsetParent;
      const trigger = triggers.current.get(value);
      // The open menu's own box: Radix sizes the viewport to it only a frame or two later.
      const content = view?.querySelector<HTMLElement>(
        ':scope > [data-state="open"]',
      );
      if (!(box instanceof HTMLElement) || !content || !trigger) return;
      const width = content.offsetWidth;
      const natural = content.offsetHeight;
      if (width === 0 || natural === 0) return;
      const row = box.getBoundingClientRect();
      const reach = panel.current?.firstElementChild;
      const below =
        window.innerHeight -
        row.top -
        (reach instanceof HTMLElement ? reach.offsetHeight : 0) -
        GUTTER;
      const room = Math.max(SHORTEST, Math.floor(below));
      const height = Math.min(natural, room);
      const target = trigger.getBoundingClientRect();
      const center = target.left + target.width / 2 - row.left;
      const x = Math.max(
        0,
        Math.min(box.clientWidth - width, Math.round(center - width / 2)),
      );
      placed.current = true;
      setGeometry((current) => {
        const next = {
          x,
          width,
          height,
          capped: natural > room,
          first: current === null,
        };
        return sameGeometry(current, next) ? current : next;
      });
    };
    // An opening panel places itself as Motion's next frame starts, so it starts unfolding on a frame
    // boundary rather than part-way through the busy one that mounted it. Switching menus moves at once.
    let pending: Process | undefined;
    const place = (): void => {
      if (placed.current) {
        flushSync(measure);
        return;
      }
      if (pending) cancelFrame(pending);
      pending = frame.read(() => {
        pending = undefined;
        flushSync(measure);
      });
    };
    const resized = new ResizeObserver(measure);
    const box = panel.current?.offsetParent;
    if (box instanceof HTMLElement) resized.observe(box);
    const watch = (): void => {
      for (const child of view?.children ?? []) resized.observe(child);
    };
    // A menu's columns can arrive a commit after the panel.
    const arrived = new MutationObserver(() => {
      watch();
      place();
    });
    if (view) arrived.observe(view, { childList: true });
    watch();
    if (placed.current) measure();
    else place();
    return () => {
      if (pending) cancelFrame(pending);
      resized.disconnect();
      arrived.disconnect();
    };
  }, [open, value, triggers, panel]);

  const first = geometry?.first ?? true;
  const move: Transition = reduced
    ? reducedTransition
    : first
      ? { x: spring.instant, width: spring.instant, opacity: unfold }
      : { default: spring.snappy, opacity: unfold };
  const grow: Transition = reduced
    ? reducedTransition
    : first
      ? unfold
      : spring.snappy;

  return (
    <AnimatePresence
      onExitComplete={() => {
        placed.current = false;
        setGeometry(null);
      }}
    >
      {open ? (
        <motion.div
          {...tracking}
          key="panel"
          ref={panel}
          className="bt-morph-menu-panel"
          data-bt-part="panel"
          data-bt-float=""
          initial={{ opacity: 0 }}
          animate={
            geometry
              ? { x: geometry.x, width: geometry.width, opacity: 1 }
              : { opacity: 0 }
          }
          exit={{ opacity: 0, transition: reduced ? reducedTransition : fold }}
          transition={move}
          onPointerEnter={menu.hold}
          onPointerLeave={menu.release}
        >
          <div data-bt-part="reach" />
          <motion.div
            {...tracking}
            className="bt-surface"
            data-level="floating"
            data-bt-part="body"
            data-capped={geometry?.capped ? "" : undefined}
            initial={{ height: 0 }}
            animate={geometry ? { height: geometry.height } : { height: 0 }}
            {...(reduced ? {} : { exit: { height: 0, transition: fold } })}
            transition={grow}
          >
            <RadixNav.Viewport
              forceMount
              ref={viewport}
              className="bt-morph-menu-viewport"
              onPointerEnter={keepRadixTimersOff}
              onPointerLeave={keepRadixTimersOff}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Where Tab goes once it leaves a trigger's menu: the next tab stop in the row, or past the row's last item,
 * the first one after the whole menu, so it never lands on Radix's hidden sentinel.
 */
function stopAfter(trigger: Element): HTMLElement | undefined {
  for (
    let item = trigger.closest("li")?.nextElementSibling;
    item;
    item = item.nextElementSibling
  ) {
    const [stop] = tabbables(item);
    if (stop) return stop;
  }
  const menu = trigger.closest('[data-bt="MorphMenu"]');
  if (!menu) return undefined;
  return tabbables(document.body).find(
    (stop) =>
      !menu.contains(stop) &&
      (menu.compareDocumentPosition(stop) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
        0,
  );
}

function Chevron({ open }: { readonly open: boolean }): ReactElement {
  const transition = useButteryTransition("snappy");
  return (
    <motion.span
      className="bt-morph-menu-chevron"
      aria-hidden="true"
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={transition}
    >
      <Icon icon={ChevronDown} />
    </motion.span>
  );
}

function MenuBody({
  featured,
  footer,
  children,
}: {
  readonly featured?: ReactNode;
  readonly footer?: ReactNode;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <>
      <div data-bt-part="main">
        <div data-bt-part="morph-menu-columns">{children}</div>
        {hasContent(footer) ? (
          <div data-bt-part="morph-menu-footer">{footer}</div>
        ) : null}
      </div>
      {hasContent(featured) ? (
        <div data-bt-part="featured">{featured}</div>
      ) : null}
    </>
  );
}

/** Props for `MorphMenu`. */
export interface MorphMenuProps extends Omit<
  ComponentPropsWithRef<"nav">,
  "defaultValue" | "dir"
> {
  /** Names the navigation for screen readers. Defaults to `"Main"`. */
  readonly label?: string | undefined;
  /** The open menu's `value`, or `""` while none is open. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The menu open at first when uncontrolled. Defaults to `""`, none. */
  readonly defaultValue?: string | undefined;
  /** Called when a menu opens, another takes over, or the open one closes (`""`). */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /**
   * `"bar"` (the default) puts the triggers in a row whose menus open in one shared panel. `"stack"` lists
   * the menus as sections that open in place, one at a time, as in a nav bar's phone sheet.
   */
  readonly layout?: MorphMenuLayout | undefined;
}

function MorphMenuRoot({
  label = "Main",
  value,
  defaultValue = "",
  onValueChange,
  layout = "bar",
  className,
  children,
  ...rest
}: MorphMenuProps): ReactElement {
  const [open, setOpen] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const triggers = useRef(new Map<string, HTMLElement>());
  const panel = useRef<HTMLDivElement>(null);
  const current = useRef(open);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const closedAt = useRef(Number.NEGATIVE_INFINITY);
  const visiting = useRef<string | null>(null);
  const asked = useRef(false);
  const blocked = useRef<string | null>(null);

  useLayoutEffect(() => {
    current.current = open;
  });

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  // Every open or close goes through here and cancels whatever was waiting, so a hover that began before a
  // click or an Escape can't open the menu again afterwards. Only a close by the pointer leaving, which
  // stamps closedAt after this, lets the next menu open at once.
  const change = useCallback(
    (next: string) => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
      closedAt.current = Number.NEGATIVE_INFINITY;
      if (
        next === "" &&
        current.current !== "" &&
        visiting.current === current.current
      )
        blocked.current = visiting.current;
      setOpen(next);
    },
    [setOpen],
  );

  // The pointer leaves an open menu alone while keyboard focus is in it. Focus that a click left there goes
  // to the trigger of the menu that's open next, or of the one closing, so it never drops to the page.
  const pointerMayChange = useCallback((next: string): boolean => {
    if (panel.current?.contains(document.activeElement) !== true) return true;
    if (lastInput() === "keyboard") return false;
    triggers.current.get(next === "" ? current.current : next)?.focus();
    return true;
  }, []);

  const register = useCallback((item: string, element: HTMLElement | null) => {
    if (element) triggers.current.set(item, element);
    else triggers.current.delete(item);
  }, []);
  const hold = useCallback((event: PointerEvent) => {
    if (event.pointerType === "mouse") window.clearTimeout(closeTimer.current);
  }, []);
  const release = useCallback(
    (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      window.clearTimeout(closeTimer.current);
      if (current.current === "") return;
      closeTimer.current = window.setTimeout(() => {
        if (!pointerMayChange("")) return;
        change("");
        closedAt.current = performance.now();
      }, timing["delay-hover-close"]);
    },
    [change, pointerMayChange],
  );
  const enter = useCallback((item: string, event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    visiting.current = item;
    asked.current = false;
    window.clearTimeout(closeTimer.current);
  }, []);
  const point = useCallback(
    (item: string, event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // MorphMenu times the pointer itself; Radix's own open timer outlives a click or Escape before it.
      event.preventDefault();
      if (asked.current || blocked.current === item) return;
      window.clearTimeout(closeTimer.current);
      if (current.current !== "" && current.current !== item) {
        if (!pointerMayChange(item)) return;
        asked.current = true;
        change(item);
        return;
      }
      asked.current = true;
      if (current.current === item) return;
      if (performance.now() - closedAt.current < timing["delay-hover-skip"]) {
        change(item);
        return;
      }
      window.clearTimeout(openTimer.current);
      openTimer.current = window.setTimeout(() => {
        change(item);
      }, timing["delay-hover-open"]);
    },
    [change, pointerMayChange],
  );
  const leave = useCallback(
    (item: string, event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // Radix's own close timer would run on even while the pointer crosses into the panel.
      event.preventDefault();
      if (visiting.current === item) visiting.current = null;
      if (blocked.current === item) blocked.current = null;
      asked.current = false;
      window.clearTimeout(openTimer.current);
      release(event);
    },
    [release],
  );
  const state: MenuState = {
    layout,
    value: open,
    register,
    hold,
    release,
    enter,
    point,
    leave,
  };

  if (layout === "stack") {
    return (
      <MenuContext value={state}>
        <nav
          {...rest}
          aria-label={label}
          className={cx("bt-morph-menu", className)}
          data-bt="MorphMenu"
          data-layout="stack"
        >
          <Accordion.Root
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            data-bt-part="list"
          >
            {children}
          </Accordion.Root>
        </nav>
      </MenuContext>
    );
  }

  return (
    <MenuContext value={state}>
      <RadixNav.Root
        {...rest}
        value={open}
        onValueChange={change}
        aria-label={label}
        className={cx("bt-morph-menu", className)}
        data-bt="MorphMenu"
        data-layout="bar"
      >
        <RadixNav.List className="bt-morph-menu-list" data-bt-part="list">
          {children}
        </RadixNav.List>
        <MorphPanel value={open} triggers={triggers} panel={panel} />
      </RadixNav.Root>
    </MenuContext>
  );
}

/** Props for `MorphMenu.Item`. */
export interface MorphMenuItemProps {
  /** The trigger's text. */
  readonly label: string;
  /** Identifies the menu in `value`. Defaults to a generated id. */
  readonly value?: string | undefined;
  /** A column at the menu's end, edge to edge on the `section` level, such as a story or a promotion. */
  readonly featured?: ReactNode;
  /** A row under the columns, past a divider, such as a "See all" `ArrowLink`. */
  readonly footer?: ReactNode;
  /** The menu's columns: `MorphMenu.Column`s. */
  readonly children?: ReactNode;
}

/**
 * A trigger and the menu it opens: a ghost pill with a chevron that turns over while the menu is open. In a
 * `"stack"` layout it's a section that opens in place.
 */
export function MorphMenuItem({
  label,
  value,
  featured,
  footer,
  children,
}: MorphMenuItemProps): ReactElement {
  const generated = useId();
  const id = value ?? generated;
  const menu = useMenu("MorphMenu.Item");
  const { register } = menu;
  const trigger = useRef<HTMLElement | null>(null);
  const open = menu.value === id;
  const bar = menu.layout === "bar";
  const fade = useAnimationTracking();
  const columns = useCallback(
    (element: HTMLElement | null) => {
      if (element) return undefined;
      // Radix unmounts the columns as they finish fading out; an unfinished fade ends with them.
      fade.onAnimationComplete();
      return undefined;
    },
    [fade],
  );
  const attach = useCallback(
    (element: HTMLElement | null) => {
      trigger.current = element;
      register(id, element);
      return () => {
        trigger.current = null;
        register(id, null);
      };
    },
    [register, id],
  );

  useLayoutEffect(() => {
    if (!bar || !open) return;
    // Radix follows an open trigger with a hidden sentinel that passes Tab into the panel. The trigger
    // does that itself, so the sentinel leaves the tab order and no hidden element is a tab stop.
    const sentinel = trigger.current?.nextElementSibling;
    if (
      sentinel instanceof HTMLElement &&
      sentinel.getAttribute("aria-hidden") === "true"
    ) {
      sentinel.setAttribute("tabindex", "-1");
    }
  }, [bar, open]);

  const body = (
    <MenuBody featured={featured} footer={footer}>
      {children}
    </MenuBody>
  );

  if (menu.layout === "stack") {
    return (
      <Accordion.Item value={id} className="bt-morph-menu-section">
        <Accordion.Header className="bt-morph-menu-section-header">
          <Accordion.Trigger
            className="bt-morph-menu-trigger bt-text bt-focus"
            data-role="control"
          >
            <span>{label}</span>
            <Chevron open={menu.value === id} />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          className="bt-morph-menu-content"
          data-bt-part="section-content"
        >
          {body}
        </Accordion.Content>
      </Accordion.Item>
    );
  }

  return (
    <RadixNav.Item value={id} className="bt-morph-menu-item">
      <RadixNav.Trigger
        ref={attach}
        className="bt-morph-menu-trigger bt-text bt-focus"
        data-role="control"
        onPointerEnter={(event) => {
          menu.enter(id, event);
        }}
        onPointerMove={(event) => {
          menu.point(id, event);
        }}
        onPointerLeave={(event) => {
          menu.leave(id, event);
        }}
        onKeyDown={(event) => {
          // Radix moves focus into an open menu on ArrowDown but leaves a closed one shut; it opens here.
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            event.currentTarget.click();
            return;
          }
          if (event.key !== "Tab" || event.shiftKey || !open) return;
          // Focusing the sentinel runs Radix's own way in, which puts the menu's links back in the tab
          // order (Radix takes them out whenever focus leaves the menu) and focuses the first.
          const sentinel = event.currentTarget.nextElementSibling;
          if (!(sentinel instanceof HTMLElement)) return;
          event.preventDefault();
          sentinel.focus();
        }}
      >
        <span>{label}</span>
        <Chevron open={menu.value === id} />
        <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
      </RadixNav.Trigger>
      <RadixNav.Content
        ref={columns}
        className="bt-morph-menu-content"
        data-bt-part="content"
        onAnimationStart={fade.onAnimationStart}
        onAnimationEnd={fade.onAnimationComplete}
        onKeyDown={(event) => {
          const from = trigger.current;
          if (event.key !== "Tab" || !from) return;
          const stops = tabbables(event.currentTarget);
          const edge = event.shiftKey ? stops[0] : stops.at(-1);
          if (document.activeElement !== edge) return;
          const to = event.shiftKey ? from : stopAfter(from);
          if (!to) return;
          event.preventDefault();
          to.focus();
        }}
      >
        {body}
      </RadixNav.Content>
    </RadixNav.Item>
  );
}

/** Props for `MorphMenu.Link`. */
export type MorphMenuLinkProps = ComponentPropsWithRef<"a">;

/** A link in the row of triggers that opens no menu, such as Pricing. Hovering it closes an open menu. */
export function MorphMenuLink({
  className,
  children,
  ...rest
}: MorphMenuLinkProps): ReactElement {
  const menu = useMenu("MorphMenu.Link");
  const link = (
    <a
      {...rest}
      className={cx("bt-morph-menu-trigger bt-text bt-focus", className)}
      data-role="control"
    >
      {children}
    </a>
  );
  if (menu.layout === "stack") {
    return <div data-bt-part="link-row">{link}</div>;
  }
  return (
    <RadixNav.Item className="bt-morph-menu-item">
      <RadixNav.Link asChild>{link}</RadixNav.Link>
    </RadixNav.Item>
  );
}

/** Props for `MorphMenu.Column`. */
export interface MorphMenuColumnProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** The column's heading, which also names its list of links. */
  readonly title?: ReactNode;
}

/** A column of `MorphMenu.Entry` links under a heading in `control` and `text-secondary`. */
export function MorphMenuColumn({
  title,
  className,
  children,
  ...rest
}: MorphMenuColumnProps): ReactElement {
  const titleId = useId();
  const titled = hasContent(title);
  return (
    <div {...rest} className={cx("bt-morph-menu-column", className)}>
      {titled ? (
        <p
          id={titleId}
          className="bt-text"
          data-role="control"
          data-bt-part="heading"
        >
          {title}
        </p>
      ) : null}
      <ul aria-labelledby={titled ? titleId : undefined} data-bt-part="entries">
        {children}
      </ul>
    </div>
  );
}

/** Props for `MorphMenu.Entry`. */
export interface MorphMenuEntryProps extends Omit<
  ComponentPropsWithRef<"a">,
  "title"
> {
  /** The link's title, in `label`. */
  readonly title: ReactNode;
  /** One line under the title, in `caption` and `text-secondary`, truncating. */
  readonly caption?: ReactNode;
}

/** A link in a menu column: its title over a one-line caption, on `bg-item-hover` when hovered. Choosing it closes the menu. */
export function MorphMenuEntry({
  title,
  caption,
  className,
  ...rest
}: MorphMenuEntryProps): ReactElement {
  const menu = useMenu("MorphMenu.Entry");
  const link = (
    <a {...rest} className={cx("bt-morph-menu-entry bt-focus", className)}>
      <Text variant="label" truncate data-bt-part="title">
        {title}
      </Text>
      {hasContent(caption) ? (
        <Text
          variant="caption"
          tone="secondary"
          truncate
          data-bt-part="caption"
        >
          {caption}
        </Text>
      ) : null}
    </a>
  );
  return (
    <li data-bt-part="entry">
      {menu.layout === "bar" ? (
        <RadixNav.Link asChild>{link}</RadixNav.Link>
      ) : (
        link
      )}
    </li>
  );
}

/** `MorphMenu` with its parts. */
export interface MorphMenuComponent {
  (props: MorphMenuProps): ReactElement;
  /** A trigger and the menu it opens. */
  readonly Item: typeof MorphMenuItem;
  /** A link in the row that opens no menu. */
  readonly Link: typeof MorphMenuLink;
  /** A column of links in a menu. */
  readonly Column: typeof MorphMenuColumn;
  /** A link in a column: a title over a caption. */
  readonly Entry: typeof MorphMenuEntry;
}

/**
 * A row of menu triggers whose menus open in one floating surface that reshapes from menu to menu instead
 * of closing and reopening (MOTION_SPEC §4.1). A menu opens once the pointer rests on its trigger for
 * `--bt-delay-hover-open` (150ms), unfolding from the row in `dur-fast`; moving to another trigger switches
 * at once, the panel's width, height and place following on `spring.snappy` while the columns crossfade,
 * the new ones sliding in from the side the pointer came from; leaving closes it after
 * `--bt-delay-hover-close` (100ms), folding up in `dur-fast`, unless keyboard focus is in it. Built on Radix
 * NavigationMenu, so the arrow keys move between triggers, Enter, Space or ArrowDown opens and Escape closes.
 * With reduced motion the panel fades in and out in 100ms and takes each menu's size at once.
 *
 * @example
 * <MorphMenu>
 *   <MorphMenu.Item label="Product" footer={<ArrowLink href="/features">See all features</ArrowLink>}>
 *     <MorphMenu.Column title="Make">
 *       <MorphMenu.Entry href="/slides" title="Slides" caption="Layouts and notes" />
 *     </MorphMenu.Column>
 *   </MorphMenu.Item>
 *   <MorphMenu.Link href="/pricing">Pricing</MorphMenu.Link>
 * </MorphMenu>
 */
export const MorphMenu: MorphMenuComponent = Object.assign(MorphMenuRoot, {
  Item: MorphMenuItem,
  Link: MorphMenuLink,
  Column: MorphMenuColumn,
  Entry: MorphMenuEntry,
});
