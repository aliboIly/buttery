import { motion } from "motion/react";
import { createContext, use } from "react";
import type { Context, ReactElement } from "react";
import { useMotionPreference } from "../motion/preference.ts";
import type { MotionElementProps } from "../motion/props.ts";
import { presencePresets, reducedPresence } from "../motion/presets.ts";
import { useAnimationTracking } from "../motion/use-animation-tracking.ts";

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
 * a second Escape right after closing it reaches the dialog or sheet beneath.
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
  return (
    <motion.div
      {...rest}
      {...tracking}
      initial={instant ? false : preset.initial}
      animate={preset.animate}
      {...(instant ? {} : { exit: preset.exit })}
      style={{ ...style, transformOrigin: `var(${origin})` }}
    />
  );
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
