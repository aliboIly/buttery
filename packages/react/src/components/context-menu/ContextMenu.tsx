import {
  FloatingMotion,
  Layer,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuPrimitivesContext,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcutsContext,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  Slot,
  canTakeFocus,
  cx,
  focusMovedOn,
  hasTabbable,
  holdsFocus,
  isApplePlatform,
  isDevelopment,
  isTypingField,
  keepInWindow,
  lastInput,
  matchesShortcut,
  space,
  useControllableState,
  useFloatingEntrance,
  useMergedRefs,
  warnOnce,
} from "@butteryui/core";
import type {
  FloatingEntrance,
  MenuCheckboxItemProps,
  MenuGroupProps,
  MenuItemProps,
  MenuItemShortcut,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuShortcutRegistry,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
} from "@butteryui/core";
import { AnimatePresence } from "motion/react";
import { ContextMenu as RadixContextMenu } from "radix-ui";
import { createContext, use, useLayoutEffect, useRef, useState } from "react";
import type {
  ComponentPropsWithRef,
  Context,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";

/** The items' shortcuts while the menu is closed, and how an item hands its shortcut in. */
interface ShortcutRegistry {
  readonly entries: ReadonlySet<MenuItemShortcut>;
  readonly register: MenuShortcutRegistry;
}

function shortcutRegistry(): ShortcutRegistry {
  const entries = new Set<MenuItemShortcut>();
  return {
    entries,
    register: (entry) => {
      entries.add(entry);
      return () => {
        entries.delete(entry);
      };
    },
  };
}

interface ContextMenuState {
  readonly open: boolean;
  readonly entrance: FloatingEntrance;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly content: RefObject<HTMLDivElement | null>;
  readonly shortcuts: ShortcutRegistry;
  /** Records that a press or focus outside the menu is what's closing it. */
  readonly pressedOutside: () => void;
}

const ContextMenuContext: Context<ContextMenuState | null> =
  createContext<ContextMenuState | null>(null);

function useContextMenu(part: string): ContextMenuState {
  const menu = use(ContextMenuContext);
  if (!menu) {
    throw new Error(
      `[buttery:ContextMenu] ContextMenu.${part} has to be inside a <ContextMenu>. Fix: <ContextMenu><ContextMenu.Trigger asChild>…</ContextMenu.Trigger><ContextMenu.Content>…</ContextMenu.Content></ContextMenu>`,
    );
  }
  return menu;
}

/** Whether the key press asks for the focused element's menu: the context-menu key, or Shift+F10. */
function asksForMenu(event: KeyboardEvent): boolean {
  if (event.key === "ContextMenu") return true;
  return (
    event.key === "F10" &&
    event.shiftKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}

/** The element a menu opened from the keyboard belongs to: the focused one, or the option it points at. */
function keyboardAnchor(focused: Element, region: Element): Element {
  const id = focused.getAttribute("aria-activedescendant");
  const active =
    id === null || id === "" ? null : focused.ownerDocument.getElementById(id);
  return active !== null && region.contains(active) ? active : focused;
}

/** How far the menu's corner sits from the point it opens at. */
const POINTER_GAP = space["0.5"];

interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * The nearest point the menu can open at and still keep 8px from the window's edges, whichever way from the
 * point it opens: it sits `POINTER_GAP` to the point's side and level with it, or ends level with it when
 * there's no room below.
 */
function withinWindow({ x, y }: Point): Point {
  const side = space["2"] - POINTER_GAP;
  const end = space["2"];
  return {
    x: Math.min(Math.max(x, side), window.innerWidth - side),
    y: Math.min(Math.max(y, end), window.innerHeight - end),
  };
}

/** Opens the menu at a point, as a right-click on `target` there would. */
function openAt(target: Element, point: Point): void {
  const { x, y } = withinWindow(point);
  target.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: x,
      clientY: y,
    }),
  );
}

/** The middle of the part of `start`–`end` inside `0`–`size`, or the nearest edge when none of it is. */
function middle(start: number, end: number, size: number): number {
  const from = Math.max(start, 0);
  const to = Math.min(end, size);
  return from < to ? (from + to) / 2 : Math.min(from, size);
}

/** Opens the menu in the middle of `anchor`'s visible part, where browsers open one from the keyboard. */
function openAtMiddleOf(anchor: Element): void {
  const box = anchor.getBoundingClientRect();
  openAt(anchor, {
    x: middle(box.left, box.right, window.innerWidth),
    y: middle(box.top, box.bottom, window.innerHeight),
  });
}

/** Props for `ContextMenu`. */
export interface ContextMenuProps {
  /**
   * Whether the menu is open. Pair with `onOpenChange` to control it. Opened this way rather than by a press,
   * it opens at the trigger, as the keyboard opens it.
   */
  readonly open?: boolean | undefined;
  /** Whether it starts open, at the trigger, when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the menu opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * `"grow"` from where it opened with a fade, or `"instant"`, complete in the next frame, as app chrome moves.
   * Defaults to what's set around it (`"instant"` inside `AppShell layout="sidebar"`), else `"grow"`.
   */
  readonly entrance?: FloatingEntrance | undefined;
  /** The region and the menu: `ContextMenu.Trigger` and `ContextMenu.Content`. */
  readonly children?: ReactNode;
}

function ContextMenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  entrance,
  children,
}: ContextMenuProps): ReactElement {
  const arrival = useFloatingEntrance(entrance);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const trigger = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const outside = useRef(false);
  const leaving = useRef<HTMLDivElement | null>(null);
  const [shortcuts] = useState(shortcutRegistry);

  // Before the menu's focus scope moves focus in, so it still sees what had focus; after a close commits, so
  // focus goes back the moment the menu starts to leave.
  useLayoutEffect(() => {
    if (isOpen) {
      outside.current = false;
      const active = document.activeElement;
      opener.current =
        active instanceof HTMLElement && active !== document.body
          ? active
          : null;
      // Opened again while it was still fading out, it's the same element, so its focus scope doesn't move focus
      // in, and Radix would hand focus to the item it last had rather than the first.
      const revived = content.current;
      if (revived !== null && revived === leaving.current) {
        const first =
          lastInput() === "keyboard"
            ? revived.querySelector<HTMLElement>(
                '[role^="menuitem"]:not([data-disabled])',
              )
            : null;
        (first ?? revived).focus({ preventScroll: true });
      }
      leaving.current = null;
      return;
    }
    leaving.current = content.current;
    if (!outside.current && holdsFocus(content.current))
      [opener.current, trigger.current].find(canTakeFocus)?.focus();
  }, [isOpen]);

  return (
    <ContextMenuContext
      value={{
        open: isOpen,
        entrance: arrival,
        trigger,
        content,
        shortcuts,
        pressedOutside: () => {
          outside.current = true;
        },
      }}
    >
      <MenuPrimitivesContext value={RadixContextMenu}>
        <RadixContextMenu.Root
          open={isOpen}
          onOpenChange={setOpen}
          modal={false}
        >
          {children}
        </RadixContextMenu.Root>
      </MenuPrimitivesContext>
    </ContextMenuContext>
  );
}

/** Props for `ContextMenu.Trigger`. */
export interface ContextMenuTriggerProps extends ComponentPropsWithRef<"div"> {
  /**
   * Makes your own element the region, with the trigger's props merged onto it, such as a row, a card or a
   * canvas. It has to take focus, or hold something that does, for the keyboard to open the menu.
   */
  readonly asChild?: boolean | undefined;
  /**
   * Leaves the region to the browser's own menu: a right-click, a long press and the menu keys open nothing,
   * and the items' shortcuts don't run. Defaults to `false`.
   */
  readonly disabled?: boolean | undefined;
}

/**
 * The region the menu belongs to. A right-click opens the menu where the pointer is, and so does a long press
 * on touch. With focus in it, the context-menu key or Shift+F10 opens the menu at the focused element (or the
 * option its `aria-activedescendant` points at), and the items' shortcuts run while the menu is closed.
 */
export function ContextMenuTrigger({
  asChild = false,
  disabled = false,
  onContextMenu,
  onKeyDown,
  ref,
  ...rest
}: ContextMenuTriggerProps): ReactElement {
  const menu = useContextMenu("Trigger");
  const { open, trigger, shortcuts } = menu;
  const refs = useMergedRefs(ref, trigger);
  const pointed = useRef(false);
  const Root = asChild ? Slot : "div";

  // An owner's `open` and `defaultOpen` open the menu without a press, so it opens at the trigger.
  useLayoutEffect(() => {
    if (!open) {
      pointed.current = false;
      return;
    }
    const element = trigger.current;
    if (pointed.current || !element) return;
    openAtMiddleOf(keyboardAnchor(element, element));
  }, [open, trigger]);

  useLayoutEffect(() => {
    const element = trigger.current;
    if (!isDevelopment || disabled || !element) return;
    if (element.tabIndex >= 0 || hasTabbable(element)) return;
    warnOnce(
      "ContextMenu",
      `The trigger <${element.localName}> can't take focus and holds nothing that can, so the keyboard can't open its menu or use its shortcuts. Fix: give it tabIndex={0} with a role and a name, or put a button or link inside it.`,
    );
  }, [disabled, trigger]);

  return (
    <RadixContextMenu.Trigger asChild disabled={disabled}>
      <Root
        {...rest}
        ref={refs}
        onContextMenu={(event) => {
          onContextMenu?.(event);
          if (disabled || event.defaultPrevented) return;
          const pressed = { x: event.clientX, y: event.clientY };
          const { x, y } = withinWindow(pressed);
          if (
            (x !== pressed.x || y !== pressed.y) &&
            event.target instanceof Element
          ) {
            // Radix opens the menu at the press's own point, which here is too near the window's edge to keep 8px.
            event.preventDefault();
            openAt(event.target, pressed);
            return;
          }
          pointed.current = true;
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            disabled ||
            event.defaultPrevented ||
            event.nativeEvent.isComposing
          )
            return;
          if (event.target instanceof Element && asksForMenu(event)) {
            event.preventDefault();
            openAtMiddleOf(keyboardAnchor(event.target, event.currentTarget));
            return;
          }
          if (open || isTypingField(event.target)) return;
          const apple = isApplePlatform();
          for (const entry of shortcuts.entries) {
            if (!matchesShortcut(event.nativeEvent, entry.shortcut, apple))
              continue;
            event.preventDefault();
            entry.run(event.nativeEvent);
            return;
          }
        }}
      />
    </RadixContextMenu.Trigger>
  );
}

/** Props for `ContextMenu.Content`. Where it opens and how far it stays inside the window are fixed by buttery. */
export type ContextMenuContentProps = Omit<
  ComponentPropsWithRef<typeof RadixContextMenu.Content>,
  | "side"
  | "sideOffset"
  | "align"
  | "alignOffset"
  | "collisionPadding"
  | "forceMount"
  | "asChild"
>;

/**
 * The list of actions, on the floating surface, as `Menu.Content` draws it. Its corner opens at the pointer
 * (or the middle of the focused element), it flips and shifts to stay 8px inside the window, and it grows in
 * from that corner and fades out. Focus goes back to where it was as it closes, unless a press elsewhere
 * closed it. While it's closed, its items draw nothing and their shortcuts work from the trigger.
 */
export function ContextMenuContent({
  className,
  children,
  onInteractOutside,
  onCloseAutoFocus,
  onContextMenu,
  ref,
  ...rest
}: ContextMenuContentProps): ReactElement {
  const menu = useContextMenu("Content");
  const owned = useMergedRefs(ref, menu.content);
  const refs = useMergedRefs(owned, keepInWindow);
  return (
    <>
      <AnimatePresence>
        {menu.open ? (
          <Layer band="dropdown" key="menu">
            <RadixContextMenu.Content
              {...rest}
              forceMount
              asChild
              side="right"
              align="start"
              sideOffset={POINTER_GAP}
              collisionPadding={space["2"]}
              onInteractOutside={(event) => {
                onInteractOutside?.(event);
                menu.pressedOutside();
              }}
              onCloseAutoFocus={(event) => {
                onCloseAutoFocus?.(event);
                if (focusMovedOn(menu.content.current)) event.preventDefault();
              }}
              onContextMenu={(event) => {
                onContextMenu?.(event);
                event.preventDefault();
              }}
            >
              <FloatingMotion
                ref={refs}
                origin="--radix-context-menu-content-transform-origin"
                entrance={menu.entrance}
                className={cx("bt-surface bt-menu bt-context-menu", className)}
                data-level="floating"
                data-bt="ContextMenu"
              >
                {children}
              </FloatingMotion>
            </RadixContextMenu.Content>
          </Layer>
        ) : null}
      </AnimatePresence>
      {menu.open ? null : (
        <MenuShortcutsContext value={menu.shortcuts.register}>
          {children}
        </MenuShortcutsContext>
      )}
    </>
  );
}

/** Props for `ContextMenu.Item`. */
export type ContextMenuItemProps = MenuItemProps;

/**
 * One action, as `Menu.Item` draws it: `onSelect` runs it and the menu closes. Its `shortcut` shows at its end
 * and runs `onSelect` while focus is in the trigger and the menu is closed.
 */
export const ContextMenuItem: typeof MenuItem = MenuItem;

/** Props for `ContextMenu.CheckboxItem`. */
export type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;

/** Something on or off, with a check at its end while it's on, as `Menu.CheckboxItem` draws it. */
export const ContextMenuCheckboxItem: typeof MenuCheckboxItem =
  MenuCheckboxItem;

/** Props for `ContextMenu.Separator`. */
export type ContextMenuSeparatorProps = MenuSeparatorProps;

/** A line between groups of actions, with 6px above and below it. */
export const ContextMenuSeparator: typeof MenuSeparator = MenuSeparator;

/** Props for `ContextMenu.Group`. */
export type ContextMenuGroupProps = MenuGroupProps;

/** A group of related actions, with an optional heading that names it. */
export const ContextMenuGroup: typeof MenuGroup = MenuGroup;

/** Props for `ContextMenu.RadioGroup`. */
export type ContextMenuRadioGroupProps = MenuRadioGroupProps;

/** A set of items where one is chosen, shown with a check, such as a layout or a color. */
export const ContextMenuRadioGroup: typeof MenuRadioGroup = MenuRadioGroup;

/** Props for `ContextMenu.RadioItem`. */
export type ContextMenuRadioItemProps = MenuRadioItemProps;

/** One choice in a `ContextMenu.RadioGroup`; the chosen one shows a 16px check at its end. */
export const ContextMenuRadioItem: typeof MenuRadioItem = MenuRadioItem;

/** Props for `ContextMenu.Sub`. */
export type ContextMenuSubProps = MenuSubProps;

/** A submenu: an item that opens a second list to its side. */
export const ContextMenuSub: typeof MenuSub = MenuSub;

/** Props for `ContextMenu.SubTrigger`. */
export type ContextMenuSubTriggerProps = MenuSubTriggerProps;

/**
 * The item that opens a submenu, with a chevron at its end: once the pointer has rested on it for 40ms, with
 * ArrowRight, or with Enter or Space.
 */
export const ContextMenuSubTrigger: typeof MenuSubTrigger = MenuSubTrigger;

/** Props for `ContextMenu.SubContent`. */
export type ContextMenuSubContentProps = MenuSubContentProps;

/** The submenu's list, beside its item with its first item level with it, fading in over `dur-fast`. */
export const ContextMenuSubContent: typeof MenuSubContent = MenuSubContent;

/** `ContextMenu` with its parts. */
export interface ContextMenuComponent {
  (props: ContextMenuProps): ReactElement;
  /** The region the menu belongs to. */
  readonly Trigger: typeof ContextMenuTrigger;
  /** The floating list. */
  readonly Content: typeof ContextMenuContent;
  /** One action. */
  readonly Item: typeof ContextMenuItem;
  /** Something on or off. */
  readonly CheckboxItem: typeof ContextMenuCheckboxItem;
  /** A line between groups. */
  readonly Separator: typeof ContextMenuSeparator;
  /** A group with an optional heading. */
  readonly Group: typeof ContextMenuGroup;
  /** A set of items where one is chosen. */
  readonly RadioGroup: typeof ContextMenuRadioGroup;
  /** One choice in a radio group. */
  readonly RadioItem: typeof ContextMenuRadioItem;
  /** A submenu. */
  readonly Sub: typeof ContextMenuSub;
  /** The item that opens a submenu. */
  readonly SubTrigger: typeof ContextMenuSubTrigger;
  /** The submenu's list. */
  readonly SubContent: typeof ContextMenuSubContent;
}

/**
 * A menu of actions for whatever is under the pointer: a right-click (or a long press on touch) opens it at
 * the pointer, and the context-menu key or Shift+F10 opens it at the focused element. It's `Menu`'s list,
 * with the same parts, look and motion, in the dropdown layer. Arrow keys move through it, Enter or Space
 * chooses, Escape closes it and puts focus back where it was. An item's `shortcut` also works while focus is
 * in the trigger, so what the menu shows is what the keys do. Controlled with `open`/`onOpenChange` or
 * uncontrolled with `defaultOpen`.
 *
 * @example
 * <ContextMenu>
 *   <ContextMenu.Trigger asChild>
 *     <button type="button" onClick={open}>Q3 roast plan.pdf</button>
 *   </ContextMenu.Trigger>
 *   <ContextMenu.Content aria-label="Q3 roast plan.pdf">
 *     <ContextMenu.Item icon={Copy} shortcut="mod+d" onSelect={duplicate}>Duplicate</ContextMenu.Item>
 *     <ContextMenu.Separator />
 *     <ContextMenu.Item icon={Trash2} tone="danger" shortcut="backspace" onSelect={remove}>Delete</ContextMenu.Item>
 *   </ContextMenu.Content>
 * </ContextMenu>
 */
export const ContextMenu: ContextMenuComponent = Object.assign(
  ContextMenuRoot,
  {
    Trigger: ContextMenuTrigger,
    Content: ContextMenuContent,
    Item: ContextMenuItem,
    CheckboxItem: ContextMenuCheckboxItem,
    Separator: ContextMenuSeparator,
    Group: ContextMenuGroup,
    RadioGroup: ContextMenuRadioGroup,
    RadioItem: ContextMenuRadioItem,
    Sub: ContextMenuSub,
    SubTrigger: ContextMenuSubTrigger,
    SubContent: ContextMenuSubContent,
  },
);
