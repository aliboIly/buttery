import { motion } from "motion/react";
import type { ReactElement } from "react";
import { useMotionPreference } from "../motion/preference.ts";
import type { MotionElementProps } from "../motion/props.ts";
import { presencePresets, reducedPresence } from "../motion/presets.ts";
import { useAnimationTracking } from "../motion/use-animation-tracking.ts";

/** Props for `FloatingMotion`. */
export interface FloatingMotionProps extends MotionElementProps<"div"> {
  /** The variable Radix sets to the side the panel opens from, such as `--radix-popover-content-transform-origin`. */
  readonly origin: `--radix-${string}`;
}

/**
 * The element a menu or popover renders as inside `AnimatePresence`: it grows from 97% on the side of its
 * trigger on `spring.snappy` with a `dur-base` fade, and leaves with a `dur-fast` fade. With reduced motion
 * it fades in and out in 100ms.
 */
export function FloatingMotion({
  origin,
  style,
  ...rest
}: FloatingMotionProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const preset = reduced ? reducedPresence : presencePresets.menu;
  return (
    <motion.div
      {...rest}
      {...tracking}
      initial={preset.initial}
      animate={preset.animate}
      exit={preset.exit}
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
