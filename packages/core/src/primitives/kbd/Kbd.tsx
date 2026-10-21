import { VisuallyHidden } from "radix-ui";
import { useSyncExternalStore } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { parseShortcut } from "../../hooks/use-shortcut.ts";
import type { Shortcut } from "../../hooks/use-shortcut.ts";
import { cx } from "../../utils/cx.ts";
import { isApplePlatform } from "../../utils/platform.ts";

/** A key buttery knows by name, or any other key as it's written, such as `"K"` or `"/"`. */
export type KbdKey =
  | "mod"
  | "alt"
  | "shift"
  | "ctrl"
  | "enter"
  | "escape"
  | "backspace"
  | "delete"
  | "tab"
  | "space"
  | "up"
  | "down"
  | "left"
  | "right"
  | (string & Record<never, never>);

interface NamedKey {
  readonly apple: string;
  readonly other: string;
  /** What screen readers should say for a symbol. */
  readonly name: string;
}

const NAMED: Readonly<Partial<Record<string, NamedKey>>> = {
  mod: { apple: "⌘", other: "Ctrl", name: "Command" },
  alt: { apple: "⌥", other: "Alt", name: "Option" },
  shift: { apple: "⇧", other: "Shift", name: "Shift" },
  ctrl: { apple: "⌃", other: "Ctrl", name: "Control" },
  enter: { apple: "↵", other: "Enter", name: "Return" },
  escape: { apple: "Esc", other: "Esc", name: "Escape" },
  backspace: { apple: "⌫", other: "Backspace", name: "Delete" },
  delete: { apple: "⌦", other: "Del", name: "Forward delete" },
  tab: { apple: "⇥", other: "Tab", name: "Tab" },
  space: { apple: "Space", other: "Space", name: "Space" },
  up: { apple: "↑", other: "↑", name: "Up arrow" },
  down: { apple: "↓", other: "↓", name: "Down arrow" },
  left: { apple: "←", other: "←", name: "Left arrow" },
  right: { apple: "→", other: "→", name: "Right arrow" },
};

const unchanging = (): (() => void) => () => undefined;

function serverPlatform(): boolean {
  return false;
}

/** Whether this runs on an Apple platform, where `mod` is ⌘ rather than Ctrl. False while rendering on a server. */
export function useApplePlatform(): boolean {
  return useSyncExternalStore(unchanging, isApplePlatform, serverPlatform);
}

const SHORTCUT_CAPS: Readonly<Partial<Record<string, KbdKey>>> = {
  " ": "space",
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
};

/** A shortcut's keys as caps for `Kbd`: `"mod+shift+z"` becomes `["mod", "shift", "Z"]`. */
export function shortcutKeys(shortcut: Shortcut): KbdKey[] {
  const { key, mod, ctrl, alt, shift } = parseShortcut(shortcut);
  const modifiers: KbdKey[] = [];
  if (mod) modifiers.push("mod");
  if (ctrl) modifiers.push("ctrl");
  if (alt) modifiers.push("alt");
  if (shift) modifiers.push("shift");
  const cap =
    SHORTCUT_CAPS[key] ?? (key.length === 1 ? key.toUpperCase() : key);
  return [...modifiers, cap];
}

const ARIA_KEYS: Readonly<Partial<Record<string, string>>> = {
  " ": "Space",
  escape: "Escape",
  enter: "Enter",
  backspace: "Backspace",
  delete: "Delete",
  tab: "Tab",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
};

/** A shortcut as `aria-keyshortcuts` writes it: `"mod+n"` is `"Meta+N"` on Apple platforms and `"Control+N"` elsewhere. */
export function ariaKeyShortcuts(shortcut: Shortcut, apple: boolean): string {
  const { key, mod, ctrl, alt, shift } = parseShortcut(shortcut);
  const modifiers = new Set<string>();
  if (mod) modifiers.add(apple ? "Meta" : "Control");
  if (ctrl) modifiers.add("Control");
  if (alt) modifiers.add("Alt");
  if (shift) modifiers.add("Shift");
  const name = ARIA_KEYS[key] ?? (key.length === 1 ? key.toUpperCase() : key);
  return [...modifiers, name].join("+");
}

function capFor(key: KbdKey, apple: boolean): ReactNode {
  const named = NAMED[key];
  if (!named) return key;
  const shown = apple ? named.apple : named.other;
  if (/^[A-Za-z ]+$/.test(shown)) return shown;
  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <VisuallyHidden.Root>{named.name}</VisuallyHidden.Root>
    </>
  );
}

/** Props for `Kbd`. */
export interface KbdProps extends ComponentPropsWithRef<"kbd"> {
  /**
   * A shortcut's keys in order, each drawn as its own cap: `["mod", "Z"]` shows ⌘ Z on Apple platforms and
   * Ctrl Z elsewhere. Without it, the children are a single cap.
   */
  readonly keys?: readonly KbdKey[] | undefined;
}

/**
 * Keycaps for a keyboard shortcut, with `mod` shown as Command on Apple platforms and Ctrl elsewhere.
 * Screen readers hear key names rather than symbols.
 *
 * @example
 * <Kbd keys={["mod", "shift", "Z"]} />
 * <Kbd>Esc</Kbd>
 */
export function Kbd({
  keys,
  className,
  children,
  ...rest
}: KbdProps): ReactElement {
  const apple = useApplePlatform();
  return (
    <kbd {...rest} className={cx("bt-kbd", className)} data-bt="Kbd">
      {keys ? (
        keys.map((key, index) => (
          <kbd key={`${String(index)}-${key}`} data-bt-part="key">
            {capFor(key, apple)}
          </kbd>
        ))
      ) : (
        <kbd data-bt-part="key">{children}</kbd>
      )}
    </kbd>
  );
}
