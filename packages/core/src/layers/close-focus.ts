import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  canTakeFocus,
  lastFocusedOutside,
  lastInput,
} from "../utils/focus-history.ts";

/** Where focus can go when a surface closes and nothing better is there, such as a sidebar's current link. */
export type CloseFocusFallback = () => HTMLElement | null | undefined;

/**
 * Hands focus back as a modal surface closes, for Radix's `onCloseAutoFocus`. If something chosen in the
 * surface moved focus on, such as a link to a section, focus stays there. Otherwise it goes back to what
 * had it when the surface opened, then to the surface's `trigger`, then to `fallback`, then to wherever
 * focus last was outside the surface (without scrolling to it), whichever can still take it. So a dialog
 * opened from a menu, a shortcut or code never drops focus to the page. A surface a pointer press opened
 * while nothing had focus, as a click on a button does in WebKit, skips that last step and leaves focus on
 * the page, since where focus last was may be far from where the press was.
 *
 * @example
 * const closeFocus = useCloseFocus(open, panel, trigger);
 * <RadixDialog.Content onCloseAutoFocus={closeFocus}>…</RadixDialog.Content>
 */
export function useCloseFocus(
  open: boolean,
  surface: RefObject<HTMLElement | null>,
  trigger?: RefObject<HTMLElement | null>,
  fallback?: CloseFocusFallback,
): (event: Event) => void {
  const opener = useRef<HTMLElement | null>(null);
  const pressedOpen = useRef(false);
  const fallbackRef = useRef(fallback);

  useLayoutEffect(() => {
    fallbackRef.current = fallback;
  });

  // Runs before the surface's focus scope moves focus in, so it still sees what had focus.
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    opener.current =
      active instanceof HTMLElement && active !== document.body ? active : null;
    pressedOpen.current = opener.current === null && lastInput() === "pointer";
  }, [open]);

  return (event) => {
    event.preventDefault();
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active !== document.body &&
      surface.current?.contains(active) !== true
    )
      return;
    const target = [
      opener.current,
      trigger?.current,
      fallbackRef.current?.(),
    ].find(canTakeFocus);
    if (target) {
      target.focus();
      return;
    }
    if (pressedOpen.current) return;
    lastFocusedOutside(surface.current)?.focus({ preventScroll: true });
  };
}
