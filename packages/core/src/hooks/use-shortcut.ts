import { useEffect, useRef } from "react";
import { warnOnce } from "../utils/dev.ts";
import { isApplePlatform } from "../utils/platform.ts";

/**
 * A key combination: modifiers joined with `+` before one key, such as `"mod+o"`, `"mod+shift+z"` or
 * `"escape"`. `mod` is ⌘ on Apple platforms and Ctrl elsewhere; `cmd`, `command` and `meta` mean `mod`
 * too, `option` and `opt` mean `alt`, and `control` means `ctrl`. A shortcut naming any other modifier
 * never fires, and says so in development.
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

/** A shortcut split into its key and modifiers, from `parseShortcut`. */
export interface ParsedShortcut {
  /** The key, lowercased, as `KeyboardEvent.key` names it, such as `"z"` or `"escape"`. */
  readonly key: string;
  /** ⌘ on Apple platforms, Ctrl elsewhere. */
  readonly mod: boolean;
  /** Shift. */
  readonly shift: boolean;
  /** Alt, Option on Apple platforms. */
  readonly alt: boolean;
  /** Ctrl on every platform. */
  readonly ctrl: boolean;
  /** Whether every modifier it names is one buttery knows; a shortcut that names another never matches. */
  readonly known: boolean;
}

type Modifier = "mod" | "shift" | "alt" | "ctrl";

const MODIFIER_NAMES: Readonly<Partial<Record<string, Modifier>>> = {
  mod: "mod",
  cmd: "mod",
  command: "mod",
  meta: "mod",
  shift: "shift",
  alt: "alt",
  option: "alt",
  opt: "alt",
  ctrl: "ctrl",
  control: "ctrl",
};

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
  const modifiers = new Set<Modifier>();
  let known = true;
  for (const name of parts.slice(0, -1)) {
    const modifier = MODIFIER_NAMES[name];
    if (modifier) {
      modifiers.add(modifier);
    } else {
      known = false;
      warnOnce(
        "useShortcut",
        `"${shortcut}" names a modifier buttery doesn't know, "${name}", so it never fires. Fix: use mod (⌘ on Apple platforms, Ctrl elsewhere), shift, alt or ctrl, such as "mod+shift+z".`,
      );
    }
  }
  return {
    key: KEY_NAMES[key] ?? key,
    mod: modifiers.has("mod"),
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt"),
    ctrl: modifiers.has("ctrl"),
    known,
  };
}

/**
 * Whether a key or paste event's target is a field someone types in: a text input, a text area, a select
 * or editable content. Checkboxes, radios, sliders, color and file inputs and buttons don't count.
 */
export function isTypingField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLInputElement &&
        ![
          "checkbox",
          "radio",
          "button",
          "submit",
          "reset",
          "image",
          "file",
          "hidden",
          "range",
          "color",
        ].includes(target.type)))
  );
}

const TYPEAHEAD =
  '[role="menu"], [role="menubar"], [role="listbox"], [role="combobox"], [role="tree"], [role="grid"]';

/**
 * Whether a plain key press, one without ⌘, Ctrl or Alt, belongs to something over the page: a menu or
 * list that jumps to what's typed, or an open modal dialog. Page shortcuts leave those keys alone.
 */
function heldOverPage(event: KeyboardEvent): boolean {
  const { target } = event;
  if (target instanceof Element && target.closest(TYPEAHEAD) !== null)
    return true;
  return document.querySelector('[aria-modal="true"]') !== null;
}

/** Whether a key press is the shortcut, with `mod` as ⌘ when `apple` and Ctrl otherwise. */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: Shortcut,
  apple: boolean,
): boolean {
  const wanted = parseShortcut(shortcut);
  if (!wanted.known) return false;
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
 * while typing in a field. A plain key, such as `"n"`, also waits while focus is in a menu or list that
 * jumps to what's typed, or while a modal dialog is open. An `undefined` shortcut binds nothing, for a
 * component whose shortcut is optional.
 *
 * @example
 * useShortcut("mod+z", undo);
 * useShortcut("mod+shift+z", redo);
 */
export function useShortcut(
  shortcut: Shortcut | undefined,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { enabled = true, inFields = false } = options;
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    if (!enabled || shortcut === undefined) return undefined;
    const apple = isApplePlatform();
    const listen = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing) return;
      if (!inFields && isTypingField(event.target)) return;
      if (!matchesShortcut(event, shortcut, apple)) return;
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        heldOverPage(event)
      )
        return;
      event.preventDefault();
      latest.current(event);
    };
    window.addEventListener("keydown", listen);
    return () => {
      window.removeEventListener("keydown", listen);
    };
  }, [shortcut, enabled, inFields]);
}
