import type { Transition } from "motion/react";
import { durations, easingCurves, spring } from "../tokens/motion.ts";
import type { SpringToken } from "../tokens/motion.ts";
import { useMotionPreference } from "./preference.ts";

function seconds(milliseconds: number): number {
  return milliseconds / 1000;
}

/** Opacity for things arriving: `dur-base` on the enter curve. */
export const fadeIn: Transition = {
  duration: seconds(durations.base),
  ease: easingCurves.out,
};

/** Opacity for things leaving: `dur-fast` on the exit curve, so exits finish first. */
export const fadeOut: Transition = {
  duration: seconds(durations.fast),
  ease: easingCurves.in,
};

/** Reduced motion: transforms land at once and opacity fades in at most 100ms (MOTION_SPEC rule 10). */
export const reducedTransition: Transition = {
  default: spring.instant,
  opacity: { duration: seconds(durations.reduced), ease: "linear" },
};

/**
 * The named spring from the motion tokens, or the reduced-motion transition when motion is reduced. Use
 * it for every Motion animation instead of a hand-written transition.
 *
 * @example
 * const transition = useButteryTransition("smooth");
 * return <motion.div layout transition={transition} />;
 */
export function useButteryTransition(name: SpringToken): Transition {
  const reduced = useMotionPreference() === "reduced";
  return reduced ? reducedTransition : spring[name];
}

/** Props that animate a Motion component's layout changes, from `useLayoutAnimation`. */
export interface LayoutAnimation {
  /** Motion's `layout`: off with reduced motion, so the element simply takes its new place. */
  readonly layout: boolean;
  /** The named spring, or the reduced-motion transition. */
  readonly transition: Transition;
}

/**
 * Animates a Motion component's position and size changes with a named spring. Spread it instead of
 * setting `layout` yourself: with reduced motion it turns the layout animation off, because Motion snaps
 * reduced layout animations with a zero-length animation whose last frame WebKit can drop, leaving the
 * element where it was. Under the React Compiler, also pass `layoutDependency` with the state that moves
 * the element, or it won't re-render and Motion won't see the change.
 *
 * @example
 * <motion.div {...useLayoutAnimation("smooth")} layoutDependency={expanded} />
 */
export function useLayoutAnimation(
  name: SpringToken = "smooth",
): LayoutAnimation {
  const reduced = useMotionPreference() === "reduced";
  return reduced
    ? { layout: false, transition: reducedTransition }
    : { layout: true, transition: spring[name] };
}
