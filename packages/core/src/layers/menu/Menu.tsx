import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { DropdownMenu, VisuallyHidden } from "radix-ui";
import {
  createContext,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  Context,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type { Shortcut } from "../../hooks/use-shortcut.ts";
import { useMotionPreference } from "../../motion/preference.ts";
import type { MotionElementProps } from "../../motion/props.ts";
import { reducedPresence } from "../../motion/presets.ts";
import { fadeOut } from "../../motion/transitions.ts";
import { useAnimationTracking } from "../../motion/use-animation-tracking.ts";
import { Icon } from "../../primitives/icon/Icon.tsx";
import type { IconComponentProps } from "../../primitives/icon/Icon.tsx";
import {
  Kbd,
  ariaKeyShortcuts,
  shortcutKeys,
  useApplePlatform,
} from "../../primitives/kbd/Kbd.tsx";
import { durations, easingCurves, timing } from "../../tokens/motion.ts";
import { space } from "../../tokens/space.ts";
import { cx } from "../../utils/cx.ts";
import { warnOnce } from "../../utils/dev.ts";
import { lastInput } from "../../utils/focus-history.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import {
  FloatingMotion,
  focusMovedOn,
  holdsFocus,
  keepInWindow,
  useFloatingEntrance,
} from "../floating-motion.tsx";
import type { FloatingEntrance } from "../floating-motion.tsx";
import { Layer } from "../layer/Layer.tsx";

/**
 * The Radix menu the parts (`Menu.Item`, `Menu.Sub` and the rest) render through: Radix's `DropdownMenu`
 * inside a `Menu`, its `ContextMenu` inside a `ContextMenu`.
 */
export type MenuPrimitives = Pick<
  typeof DropdownMenu,
  | "Item"
  | "CheckboxItem"
  | "RadioGroup"
  | "RadioItem"
  | "ItemIndicator"
  | "Group"
  | "Label"
  | "Separator"
  | "Sub"
  | "SubTrigger"
  | "SubContent"
>;

/**
 * Which Radix menu the parts render through, `DropdownMenu` unless set. A menu built on another Radix menu,
 * as `ContextMenu` is, sets it around its content so the same parts work in it.
 */
export const MenuPrimitivesContext: Context<MenuPrimitives> =
  createContext<MenuPrimitives>(DropdownMenu);

/** A shortcut an item answers while its menu is closed: its keys, and what choosing the item does. */
export interface MenuItemShortcut {
  /** The keys, written as `useShortcut` takes them, such as `"mod+d"`. */
  readonly shortcut: Shortcut;
  /** Does what choosing the item does. */
  readonly run: (event: KeyboardEvent) => void;
}

/** Takes an item's shortcut while its menu is closed, and gives back what lets it go again. */
export type MenuShortcutRegistry = (entry: MenuItemShortcut) => () => void;

/**
 * Set around a closed menu's parts, which then draw nothing and hand their items' shortcuts to it: how a
 * `ContextMenu` keeps its items' shortcuts working in its trigger while the menu isn't open.
 */
export const MenuShortcutsContext: Context<MenuShortcutRegistry | null> =
  createContext<MenuShortcutRegistry | null>(null);

function ShortcutBinding({ shortcut, run }: MenuItemShortcut): null {
  const register = use(MenuShortcutsContext);
  const latest = useRef(run);

  useEffect(() => {
    latest.current = run;
  });

  useEffect(() => {
    if (!register) return undefined;
    return register({
      shortcut,
      run: (event) => {
        latest.current(event);
      },
    });
  }, [register, shortcut]);

  return null;
}

interface MenuState {
  readonly open: boolean;
  readonly entrance: FloatingEntrance;
  readonly trigger: RefObject<HTMLButtonElement | null>;
  readonly content: RefObject<HTMLDivElement | null>;
  /** Records that a press or focus outside the menu is what's closing it. */
  readonly pressedOutside: () => void;
  /** Closes the menu. */
  readonly close: () => void;
}

const MenuContext: Context<MenuState | null> = createContext<MenuState | null>(
  null,
);

function useMenu(part: string): MenuState {
  const menu = use(MenuContext);
  if (!menu) {
    throw new Error(
      `[buttery:Menu] Menu.${part} has to be inside a <Menu>. Fix: <Menu><Menu.Trigger asChild>…</Menu.Trigger><Menu.Content>…</Menu.Content></Menu>`,
    );
  }
  return menu;
}

function Check(props: IconComponentProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Chevron(props: IconComponentProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Props for `Menu`. */
export interface MenuProps {
  /** Whether the menu is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the menu opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * `"grow"` from the trigger with a fade, or `"instant"`, complete in the next frame, as app chrome moves.
   * Defaults to what's set around it (`"instant"` inside `AppShell layout="sidebar"`), else `"grow"`.
   */
  readonly entrance?: FloatingEntrance | undefined;
  /** The trigger and the content: `Menu.Trigger` and `Menu.Content`. */
  readonly children?: ReactNode;
}

function MenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  entrance,
  children,
}: MenuProps): ReactElement {
  const arrival = useFloatingEntrance(entrance);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const outside = useRef(false);

  // After the close commits, so the leaving panel can't take keys and the focus move can't count as an outside press.
  useLayoutEffect(() => {
    if (isOpen) {
      outside.current = false;
    } else if (!outside.current && holdsFocus(content.current)) {
      trigger.current?.focus();
    }
  }, [isOpen]);
  return (
    <MenuContext
      value={{
        open: isOpen,
        entrance: arrival,
        trigger,
        content,
        pressedOutside: () => {
          outside.current = true;
        },
        close: () => {
          setOpen(false);
        },
      }}
    >
      <MenuPrimitivesContext value={DropdownMenu}>
        <DropdownMenu.Root open={isOpen} onOpenChange={setOpen} modal={false}>
          {children}
        </DropdownMenu.Root>
      </MenuPrimitivesContext>
    </MenuContext>
  );
}

/** Props for `Menu.Trigger`. */
export type MenuTriggerProps = ComponentPropsWithRef<
  typeof DropdownMenu.Trigger
>;

/** The control that opens the menu, with `aria-haspopup` and `aria-expanded`. Use `asChild` to make your own button the trigger. */
export function MenuTrigger({ ref, ...rest }: MenuTriggerProps): ReactElement {
  const menu = useMenu("Trigger");
  const refs = useMergedRefs(ref, menu.trigger);
  return <DropdownMenu.Trigger {...rest} ref={refs} />;
}

/** Props for `Menu.Content`. Offset and collision padding are fixed by buttery. */
export interface MenuContentProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.Content>,
  "sideOffset" | "collisionPadding" | "forceMount" | "asChild"
> {
  /** Which edge of the trigger it lines up with. Defaults to `"end"`. */
  readonly align?: "start" | "center" | "end" | undefined;
}

/**
 * The list of actions, 8px from its trigger on the floating surface. It grows in from the trigger's side
 * and fades out; focus goes back to the trigger as it closes, unless the press that closed it was
 * somewhere else.
 */
export function MenuContent({
  align = "end",
  className,
  children,
  onInteractOutside,
  onCloseAutoFocus,
  ref,
  ...rest
}: MenuContentProps): ReactElement {
  const menu = useMenu("Content");
  const refs = useMergedRefs(ref, menu.content);
  return (
    <AnimatePresence>
      {menu.open ? (
        <Layer band="dropdown" key="menu">
          <DropdownMenu.Content
            {...rest}
            forceMount
            asChild
            align={align}
            sideOffset={space["2"]}
            collisionPadding={space["2"]}
            onInteractOutside={(event) => {
              onInteractOutside?.(event);
              if (
                event.target instanceof Node &&
                menu.trigger.current?.contains(event.target) === true
              ) {
                event.preventDefault();
                return;
              }
              menu.pressedOutside();
            }}
            onCloseAutoFocus={(event) => {
              onCloseAutoFocus?.(event);
              if (focusMovedOn(menu.content.current)) event.preventDefault();
            }}
          >
            <FloatingMotion
              ref={refs}
              origin="--radix-dropdown-menu-content-transform-origin"
              entrance={menu.entrance}
              className={cx("bt-surface bt-menu", className)}
              data-level="floating"
              data-bt="Menu"
            >
              {children}
            </FloatingMotion>
          </DropdownMenu.Content>
        </Layer>
      ) : null}
    </AnimatePresence>
  );
}

/** Props for `Menu.Item`. */
export interface MenuItemProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.Item>,
  "asChild"
> {
  /** An icon before the label, such as `Copy` from lucide-react. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** A small element before the label in place of an icon, such as a 20px `Avatar` or `InitialsTile`. */
  readonly media?: ReactNode;
  /**
   * Its keyboard shortcut, written as `useShortcut` takes it, such as `"mod+d"`: shown at the item's end and
   * announced through `aria-keyshortcuts`. In a `ContextMenu` the shortcut also runs `onSelect` while focus is
   * in the trigger and the menu is closed; in a `Menu`, bind it with `useShortcut`.
   */
  readonly shortcut?: Shortcut | undefined;
  /** Draws an accent dot at the item's end for something new behind it; its name says so too. */
  readonly dot?: boolean | undefined;
  /** What the dot adds to the item's name. Defaults to `"new"`. */
  readonly dotLabel?: string | undefined;
  /** `"danger"` draws it in `danger`, for an action that deletes or resets something. Defaults to `"neutral"`. */
  readonly tone?: "neutral" | "danger" | undefined;
  /** What the action is. Long labels truncate. */
  readonly children: ReactNode;
}

/** One action. `onSelect` runs it and the menu closes; arrow keys and typing its first letters reach it. */
export function MenuItem({
  icon,
  media,
  shortcut,
  dot = false,
  dotLabel = "new",
  tone = "neutral",
  className,
  children,
  ...rest
}: MenuItemProps): ReactElement | null {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const apple = useApplePlatform();
  if (shortcuts) {
    const { disabled, onSelect } = rest;
    return shortcut === undefined ||
      disabled === true ||
      onSelect === undefined ? null : (
      <ShortcutBinding shortcut={shortcut} run={onSelect} />
    );
  }
  const text = typeof children === "string" ? children : undefined;
  return (
    <Radix.Item
      aria-keyshortcuts={
        shortcut === undefined ? undefined : ariaKeyShortcuts(shortcut, apple)
      }
      aria-label={
        dot && text !== undefined ? `${text}, ${dotLabel}` : undefined
      }
      {...rest}
      className={cx("bt-text", className)}
      data-role="menu"
      data-tone={tone === "danger" ? "danger" : undefined}
      data-bt-part="menu-item"
    >
      {media === undefined ? null : <span data-bt-part="media">{media}</span>}
      {icon ? <Icon icon={icon} /> : null}
      <span
        className="bt-truncate"
        data-bt-truncate=""
        data-bt-part="label"
        title={text}
      >
        {children}
      </span>
      {dot ? <span data-bt-part="dot" aria-hidden="true" /> : null}
      {dot && text === undefined ? (
        <VisuallyHidden.Root>{`, ${dotLabel}`}</VisuallyHidden.Root>
      ) : null}
      {shortcut === undefined ? null : (
        <Kbd
          keys={shortcutKeys(shortcut)}
          aria-hidden="true"
          data-bt-part="shortcut"
        />
      )}
    </Radix.Item>
  );
}

/** Props for `Menu.CheckboxItem`. */
export interface MenuCheckboxItemProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.CheckboxItem>,
  "asChild" | "checked" | "onCheckedChange"
> {
  /** Whether it's on. Pair with `onCheckedChange` to control it. */
  readonly checked?: boolean | undefined;
  /**
   * Whether it starts on when uncontrolled. Defaults to `false`. An uncontrolled item starts from it each time
   * its menu opens, so keep `checked` in state to remember a choice.
   */
  readonly defaultChecked?: boolean | undefined;
  /** Called with whether it's on once it's chosen. */
  readonly onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** An icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /**
   * Its keyboard shortcut, shown at its end and announced through `aria-keyshortcuts`. In a `ContextMenu` the
   * shortcut also turns it on or off while focus is in the trigger and the menu is closed, which needs
   * `checked`; in a `Menu`, bind it with `useShortcut`.
   */
  readonly shortcut?: Shortcut | undefined;
  /** What it turns on or off, such as "Show the grid". Long labels truncate. */
  readonly children: ReactNode;
}

/**
 * Something on or off, such as showing a grid: choosing it flips it and the menu closes, and while it's on
 * a 16px check shows at its end.
 */
export function MenuCheckboxItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  icon,
  shortcut,
  className,
  children,
  ...rest
}: MenuCheckboxItemProps): ReactElement | null {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const apple = useApplePlatform();
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const text = typeof children === "string" ? children : undefined;
  const uncontrolledShortcut =
    shortcuts !== null && shortcut !== undefined && checked === undefined;

  useEffect(() => {
    if (!uncontrolledShortcut) return;
    warnOnce(
      "Menu",
      `The checkbox item${text === undefined ? "" : ` "${text}"`} has a shortcut but keeps its own checked state, which starts again each time the menu opens, so the shortcut and the menu can disagree. Fix: keep it in state and pass checked and onCheckedChange.`,
    );
  }, [uncontrolledShortcut, text]);

  if (shortcuts) {
    return shortcut === undefined || rest.disabled === true ? null : (
      <ShortcutBinding
        shortcut={shortcut}
        run={() => {
          setOn(!on);
        }}
      />
    );
  }
  return (
    <Radix.CheckboxItem
      aria-keyshortcuts={
        shortcut === undefined ? undefined : ariaKeyShortcuts(shortcut, apple)
      }
      {...rest}
      checked={on}
      onCheckedChange={setOn}
      className={cx("bt-text", className)}
      data-role="menu"
      data-bt-part="menu-item"
    >
      {icon ? <Icon icon={icon} /> : null}
      <span
        className="bt-truncate"
        data-bt-truncate=""
        data-bt-part="label"
        title={text}
      >
        {children}
      </span>
      {shortcut === undefined ? null : (
        <Kbd
          keys={shortcutKeys(shortcut)}
          aria-hidden="true"
          data-bt-part="shortcut"
        />
      )}
      <span data-bt-part="check">
        <Radix.ItemIndicator>
          <Icon icon={Check} />
        </Radix.ItemIndicator>
      </span>
    </Radix.CheckboxItem>
  );
}

/** Props for `Menu.Link`. */
export interface MenuLinkProps extends Omit<
  ComponentPropsWithRef<"a">,
  "children" | "onSelect"
> {
  /** An icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Where it goes. Long labels truncate. */
  readonly children: ReactNode;
}

/**
 * A menu item that's a link: choosing it with a press, Enter or Space follows `href` (and runs an `onClick`,
 * so a router's handler works), and the menu closes.
 */
export function MenuLink({
  href,
  icon,
  className,
  children,
  onClick,
  ...rest
}: MenuLinkProps): ReactElement {
  const menu = useMenu("Link");
  return (
    <DropdownMenu.Item asChild>
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          // A router's link takes over the click with preventDefault, which also stops Radix closing the menu.
          if (event.defaultPrevented) menu.close();
        }}
        className={cx("bt-text", className)}
        data-role="menu"
        data-bt-part="menu-item"
      >
        {icon ? <Icon icon={icon} /> : null}
        <span
          className="bt-truncate"
          data-bt-truncate=""
          data-bt-part="label"
          title={typeof children === "string" ? children : undefined}
        >
          {children}
        </span>
      </a>
    </DropdownMenu.Item>
  );
}

/** Props for `Menu.Separator`. */
export type MenuSeparatorProps = Omit<
  ComponentPropsWithRef<typeof DropdownMenu.Separator>,
  "asChild"
>;

/** A line between groups of actions, with 6px above and below it. */
export function MenuSeparator(props: MenuSeparatorProps): ReactElement | null {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  if (shortcuts) return null;
  return <Radix.Separator {...props} data-bt-part="menu-separator" />;
}

/** Props for `Menu.Group`. */
export interface MenuGroupProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.Group>,
  "asChild"
> {
  /** A heading for the group, read as its name. */
  readonly label?: string | undefined;
}

/** A group of related actions, with an optional heading. */
export function MenuGroup({
  label,
  children,
  ...rest
}: MenuGroupProps): ReactElement {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const labelId = useId();
  if (shortcuts) return <>{children}</>;
  return (
    <Radix.Group
      aria-labelledby={label === undefined ? undefined : labelId}
      {...rest}
      data-bt-part="menu-group"
    >
      {label === undefined ? null : (
        <Radix.Label
          id={labelId}
          className="bt-text"
          data-role="caption"
          data-bt-part="menu-group-label"
        >
          {label}
        </Radix.Label>
      )}
      {children}
    </Radix.Group>
  );
}

/** Props for `Menu.RadioGroup`. */
export interface MenuRadioGroupProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.RadioGroup>,
  "asChild" | "value" | "onValueChange"
> {
  /** The chosen item's value. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /**
   * The value chosen at first when uncontrolled. An uncontrolled group starts from it each time its menu
   * opens, so keep `value` in state to remember a choice.
   */
  readonly defaultValue?: string | undefined;
  /** Called with the value of the item chosen. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** A heading for the group, read as its name. */
  readonly label?: string | undefined;
}

/** A set of items where one is chosen, shown with a check, such as a sort order. */
export function MenuRadioGroup({
  value,
  defaultValue,
  onValueChange,
  label,
  children,
  ...rest
}: MenuRadioGroupProps): ReactElement {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const [chosen, setChosen] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const labelId = useId();
  if (shortcuts) return <>{children}</>;
  return (
    <Radix.RadioGroup
      aria-labelledby={label === undefined ? undefined : labelId}
      {...rest}
      value={chosen}
      onValueChange={setChosen}
      data-bt-part="menu-group"
    >
      {label === undefined ? null : (
        <Radix.Label
          id={labelId}
          className="bt-text"
          data-role="caption"
          data-bt-part="menu-group-label"
        >
          {label}
        </Radix.Label>
      )}
      {children}
    </Radix.RadioGroup>
  );
}

/** Props for `Menu.RadioItem`. */
export interface MenuRadioItemProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.RadioItem>,
  "asChild"
> {
  /** An icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** A small element before the label in place of an icon, such as a 20px `InitialsTile`. */
  readonly media?: ReactNode;
  /** What the choice is. Long labels truncate. */
  readonly children: ReactNode;
}

/** One choice in a `Menu.RadioGroup`; the chosen one shows a 16px check at its end. */
export function MenuRadioItem({
  icon,
  media,
  className,
  children,
  ...rest
}: MenuRadioItemProps): ReactElement | null {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  if (shortcuts) return null;
  return (
    <Radix.RadioItem
      {...rest}
      className={cx("bt-text", className)}
      data-role="menu"
      data-bt-part="menu-item"
    >
      {media === undefined ? null : <span data-bt-part="media">{media}</span>}
      {icon ? <Icon icon={icon} /> : null}
      <span
        className="bt-truncate"
        data-bt-truncate=""
        data-bt-part="label"
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      <span data-bt-part="check">
        <Radix.ItemIndicator>
          <Icon icon={Check} />
        </Radix.ItemIndicator>
      </span>
    </Radix.RadioItem>
  );
}

interface SubState {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}

const SubContext: Context<SubState | null> = createContext<SubState | null>(
  null,
);

function useSub(part: string): SubState {
  const sub = use(SubContext);
  if (!sub) {
    throw new Error(
      `[buttery:Menu] Menu.${part} has to be inside a <Menu.Sub>. Fix: <Menu.Sub><Menu.SubTrigger>…</Menu.SubTrigger><Menu.SubContent>…</Menu.SubContent></Menu.Sub>`,
    );
  }
  return sub;
}

/** Props for `Menu.Sub`. */
export interface MenuSubProps {
  /** Whether the submenu is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the submenu opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** `Menu.SubTrigger` and `Menu.SubContent`. */
  readonly children?: ReactNode;
}

/** A submenu: an item that opens a second list to its side. */
export function MenuSub({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: MenuSubProps): ReactElement {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <SubContext value={{ open: isOpen, setOpen }}>
      {shortcuts ? (
        children
      ) : (
        <Radix.Sub open={isOpen} onOpenChange={setOpen}>
          {children}
        </Radix.Sub>
      )}
    </SubContext>
  );
}

/** Props for `Menu.SubTrigger`. */
export interface MenuSubTriggerProps extends Omit<
  ComponentPropsWithRef<typeof DropdownMenu.SubTrigger>,
  "asChild"
> {
  /** An icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** What the submenu holds, such as "Switch workspace". Long labels truncate. */
  readonly children: ReactNode;
}

/**
 * The item that opens a submenu, with a chevron at its end. The submenu opens once the pointer has rested
 * on it for `--bt-delay-submenu` (40ms), or with ArrowRight; moving toward the submenu on a diagonal keeps it
 * open.
 */
export function MenuSubTrigger({
  icon,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...rest
}: MenuSubTriggerProps): ReactElement | null {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const sub = useSub("SubTrigger");
  const timer = useRef(0);
  const cancel = (): void => {
    window.clearTimeout(timer.current);
    timer.current = 0;
  };

  useEffect(() => cancel, []);

  if (shortcuts) return null;
  return (
    <Radix.SubTrigger
      {...rest}
      className={cx("bt-text", className)}
      data-role="menu"
      data-bt-part="menu-item"
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (event.pointerType !== "mouse" || rest.disabled === true || sub.open)
          return;
        const item = event.currentTarget;
        cancel();
        // Opens once the pointer has rested, if Radix still has the item highlighted: crossing it on the way
        // into an open sibling submenu (Radix's pointer grace) leaves it unhighlighted.
        timer.current = window.setTimeout(() => {
          timer.current = 0;
          if (item.hasAttribute("data-highlighted")) sub.setOpen(true);
        }, timing["delay-submenu"]);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        cancel();
      }}
    >
      {icon ? <Icon icon={icon} /> : null}
      <span
        className="bt-truncate"
        data-bt-truncate=""
        data-bt-part="label"
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      <span data-bt-part="chevron">
        <Icon icon={Chevron} />
      </span>
    </Radix.SubTrigger>
  );
}

/** Props for `Menu.SubContent`. Offsets and collision padding are fixed by buttery. */
export type MenuSubContentProps = Omit<
  ComponentPropsWithRef<typeof DropdownMenu.SubContent>,
  "sideOffset" | "alignOffset" | "collisionPadding" | "forceMount" | "asChild"
>;

const subFadeIn = {
  duration: durations.fast / 1000,
  ease: easingCurves.out,
};

/**
 * The submenu's surface: it fades in and out, and while it leaves it's inert, so a pointer leaving its items
 * as it fades can't pull focus into it.
 */
function SubPanel({
  className,
  ref,
  ...rest
}: MotionElementProps<"div">): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const present = useIsPresent();
  const panel = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, panel);
  const left = useRef(false);

  useLayoutEffect(() => keepInWindow(panel.current), []);

  // Opened again with ArrowRight while it was still fading out, it's the same element, which Radix tried to
  // focus while it was still inert.
  useLayoutEffect(() => {
    if (!present) {
      left.current = true;
      return;
    }
    if (!left.current) return;
    left.current = false;
    if (lastInput() === "keyboard") panel.current?.focus();
  }, [present]);

  return (
    <motion.div
      {...rest}
      {...tracking}
      ref={refs}
      inert={!present}
      initial={reduced ? reducedPresence.initial : { opacity: 0 }}
      animate={
        reduced
          ? reducedPresence.animate
          : { opacity: 1, transition: subFadeIn }
      }
      exit={
        reduced ? reducedPresence.exit : { opacity: 0, transition: fadeOut }
      }
      className={cx("bt-surface bt-menu", className)}
      data-level="floating"
      data-bt="Menu"
    />
  );
}

/**
 * The submenu's list, beside its trigger with its first item level with it, on the floating surface. It
 * fades in over `dur-fast` and out as quickly.
 */
export function MenuSubContent({
  className,
  children,
  ...rest
}: MenuSubContentProps): ReactElement {
  const shortcuts = use(MenuShortcutsContext);
  const Radix = use(MenuPrimitivesContext);
  const sub = useSub("SubContent");
  if (shortcuts) return <>{children}</>;
  return (
    <AnimatePresence>
      {sub.open ? (
        <Layer band="dropdown" key="submenu">
          <Radix.SubContent
            {...rest}
            forceMount
            asChild
            sideOffset={space["2"]}
            alignOffset={-space["1.5"]}
            collisionPadding={space["2"]}
          >
            <SubPanel className={className}>{children}</SubPanel>
          </Radix.SubContent>
        </Layer>
      ) : null}
    </AnimatePresence>
  );
}

/** `Menu` with its parts. */
export interface MenuComponent {
  (props: MenuProps): ReactElement;
  /** The control that opens the menu. */
  readonly Trigger: typeof MenuTrigger;
  /** The floating list. */
  readonly Content: typeof MenuContent;
  /** One action. */
  readonly Item: typeof MenuItem;
  /** Something on or off. */
  readonly CheckboxItem: typeof MenuCheckboxItem;
  /** An item that's a link. */
  readonly Link: typeof MenuLink;
  /** A line between groups. */
  readonly Separator: typeof MenuSeparator;
  /** A group with an optional heading. */
  readonly Group: typeof MenuGroup;
  /** A set of items where one is chosen. */
  readonly RadioGroup: typeof MenuRadioGroup;
  /** One choice in a radio group. */
  readonly RadioItem: typeof MenuRadioItem;
  /** A submenu. */
  readonly Sub: typeof MenuSub;
  /** The item that opens a submenu. */
  readonly SubTrigger: typeof MenuSubTrigger;
  /** The submenu's list. */
  readonly SubContent: typeof MenuSubContent;
}

/**
 * A list of actions that opens from a trigger, on the floating surface in the dropdown layer. Arrow keys
 * move through it, typing jumps to an item, Enter or Space chooses, Escape closes, and focus goes back to
 * the trigger. Controlled with `open`/`onOpenChange` or uncontrolled with `defaultOpen`.
 *
 * @example
 * <Menu>
 *   <Menu.Trigger asChild>
 *     <IconButton icon={Ellipsis} label="Manage card" />
 *   </Menu.Trigger>
 *   <Menu.Content>
 *     <Menu.Item icon={Star} onSelect={makeDefault}>Make default</Menu.Item>
 *     <Menu.Separator />
 *     <Menu.Item icon={Trash2} tone="danger" onSelect={remove}>Remove card</Menu.Item>
 *   </Menu.Content>
 * </Menu>
 */
export const Menu: MenuComponent = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  Link: MenuLink,
  Separator: MenuSeparator,
  Group: MenuGroup,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
});
