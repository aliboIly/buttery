import { motion, useIsPresent } from "motion/react";
import { createContext, use } from "react";
import type { Context, ReactElement } from "react";
import { useMotionPreference } from "../motion/preference.ts";
import type { MotionElementProps } from "../motion/props.ts";
import { presencePresets, reducedPresence } from "../motion/presets.ts";
import { useAnimationTracking } from "../motion/use-animation-tracking.ts";
import { space } from "../tokens/space.ts";

/**
 * How a menu or popover arrives: `"grow"` from 97% on the side of its trigger with a fade, or `"instant"`,
 * complete in the next frame and gone in the next frame, as app chrome moves.
 */
export type FloatingEntrance = "grow" | "instant";

/**
 * The entrance menus and popovers use when they don't set their own. `AppShell layout="sidebar"` sets
 * `"instant"` for everything inside it; set it yourself around chrome of your own.
 */
export const FloatingEntranceContext: Context<FloatingEntrance> =
  createContext<FloatingEntrance>("grow");

/** The entrance a menu or popover uses: its own `entrance`, or the one set around it. */
export function useFloatingEntrance(
  entrance: FloatingEntrance | undefined,
): FloatingEntrance {
  const inherited = use(FloatingEntranceContext);
  return entrance ?? inherited;
}

/** Props for `FloatingMotion`. */
export interface FloatingMotionProps extends MotionElementProps<"div"> {
  /** The variable Radix sets to the side the panel opens from, such as `--radix-popover-content-transform-origin`. */
  readonly origin: `--radix-${string}`;
  /** `"grow"` (the default) or `"instant"`, which shows the panel complete and removes it at once. */
  readonly entrance?: FloatingEntrance | undefined;
}

/**
 * The element a menu or popover renders as inside `AnimatePresence`: it grows from 97% on the side of its
 * trigger on `spring.snappy` with a `dur-base` fade, and leaves with a `dur-fast` fade. With reduced motion
 * it fades in and out in 100ms. With `entrance="instant"` it shows complete and unmounts as it closes, so
 * a second Escape right after closing it reaches the dialog or sheet beneath. While it leaves it's inert, so
 * it can't take focus back from a dialog one of its items opened.
 */
export function FloatingMotion({
  origin,
  entrance = "grow",
  style,
  ...rest
}: FloatingMotionProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const preset = reduced ? reducedPresence : presencePresets.menu;
  const instant = entrance === "instant";
  const present = useIsPresent();
  return (
    <motion.div
      {...rest}
      {...tracking}
      inert={!present}
      initial={instant ? false : preset.initial}
      animate={preset.animate}
      {...(instant ? {} : { exit: preset.exit })}
      style={{ ...style, transformOrigin: `var(${origin})` }}
    />
  );
}

/**
 * Keeps a floating panel that opens beside its anchor 8px inside the window's sides, as a ref: a context menu
 * or a submenu in a window too narrow for it on either side, where Radix leaves it hanging past the edge. It
 * slides the panel sideways over its anchor with `translate` each time Radix places it, and returns what
 * stops watching.
 *
 * @example
 * <motion.div ref={keepInWindow} className="bt-surface bt-menu">…</motion.div>
 */
export function keepInWindow(
  panel: HTMLElement | null,
): (() => void) | undefined {
  const wrapper = panel?.parentElement;
  if (!panel || !wrapper) return undefined;
  const fit = (): void => {
    const box = wrapper.getBoundingClientRect();
    const edge = space["2"];
    const past = box.right - (window.innerWidth - edge);
    const shift =
      box.left - Math.max(past, 0) < edge
        ? edge - box.left
        : -Math.max(past, 0);
    panel.style.translate = shift === 0 ? "" : `${String(shift)}px 0px`;
  };
  // Radix places the panel by writing its wrapper's style, on opening and as the window moves.
  const placed = new MutationObserver(fit);
  placed.observe(wrapper, { attributes: true, attributeFilter: ["style"] });
  fit();
  return () => {
    placed.disconnect();
  };
}

/**
 * Whether focus is in a floating panel or in a layer opened from it, such as a menu's submenu, which renders
 * inside the panel's own layer: what a closing menu checks before it hands focus back to its trigger.
 */
export function holdsFocus(panel: HTMLElement | null): boolean {
  const layer = panel?.closest("[data-bt-layer]") ?? panel;
  return layer?.contains(document.activeElement) === true;
}

/**
 * Whether focus has gone somewhere else while a panel was leaving, so handing it back to the trigger as
 * the panel unmounts would take it away from where the person moved it.
 */
export function focusMovedOn(panel: HTMLElement | null): boolean {
  const active = document.activeElement;
  return (
    active !== null &&
    active !== document.body &&
    panel?.contains(active) !== true
  );
}
