import { VisuallyHidden } from "radix-ui";
import { useSyncExternalStore } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx } from "../../utils/cx.ts";

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

function onApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function serverPlatform(): boolean {
  return false;
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
  const apple = useSyncExternalStore(
    unchanging,
    onApplePlatform,
    serverPlatform,
  );
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
