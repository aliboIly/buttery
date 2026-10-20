import { useEffect, useRef } from "react";

/**
 * A key combination: modifiers joined with `+` before one key, such as `"mod+o"`, `"mod+shift+z"` or
 * `"escape"`. `mod` is ⌘ on Apple platforms and Ctrl elsewhere.
 */
export type Shortcut = string;

/** Options for `useShortcut`. */
export interface ShortcutOptions {
  /** Whether it listens. Defaults to `true`. */
  readonly enabled?: boolean | undefined;
  /**
   * Whether it fires while typing in a field. Defaults to `false`, so ⌘Z in a text field undoes the typing,
   * not the app.
   */
  readonly inFields?: boolean | undefined;
}

interface ParsedShortcut {
  readonly key: string;
  readonly mod: boolean;
  readonly shift: boolean;
  readonly alt: boolean;
  readonly ctrl: boolean;
}

const KEY_NAMES: Readonly<Partial<Record<string, string>>> = {
  escape: "escape",
  esc: "escape",
  enter: "enter",
  space: " ",
  backspace: "backspace",
  delete: "delete",
  tab: "tab",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
};

/** Splits a shortcut into its key and modifiers. */
export function parseShortcut(shortcut: Shortcut): ParsedShortcut {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts.at(-1) ?? "";
  const modifiers = new Set(parts.slice(0, -1));
  return {
    key: KEY_NAMES[key] ?? key,
    mod: modifiers.has("mod"),
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt"),
    ctrl: modifiers.has("ctrl"),
  };
}

function onApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLInputElement &&
        !["checkbox", "radio", "button", "range", "color"].includes(
          target.type,
        )))
  );
}

/** Whether a key press is the shortcut, with `mod` as ⌘ when `apple` and Ctrl otherwise. */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: Shortcut,
  apple: boolean,
): boolean {
  const wanted = parseShortcut(shortcut);
  const meta = apple ? wanted.mod : false;
  const control = apple ? wanted.ctrl : wanted.mod || wanted.ctrl;
  return (
    event.key.toLowerCase() === wanted.key &&
    event.metaKey === meta &&
    event.ctrlKey === control &&
    event.shiftKey === wanted.shift &&
    event.altKey === wanted.alt
  );
}

/**
 * Runs `handler` when the shortcut is pressed anywhere in the window, and stops the browser's own action
 * for it, such as opening a file for ⌘O. It skips presses already handled and, unless `inFields`, presses
 * while typing in a field.
 *
 * @example
 * useShortcut("mod+z", undo);
 * useShortcut("mod+shift+z", redo);
 */
export function useShortcut(
  shortcut: Shortcut,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { enabled = true, inFields = false } = options;
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const apple = onApplePlatform();
    const listen = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing) return;
      if (!inFields && isField(event.target)) return;
      if (!matchesShortcut(event, shortcut, apple)) return;
      event.preventDefault();
      latest.current(event);
    };
    window.addEventListener("keydown", listen);
    return () => {
      window.removeEventListener("keydown", listen);
    };
  }, [shortcut, enabled, inFields]);
}
