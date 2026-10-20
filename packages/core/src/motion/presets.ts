import type { TargetAndTransition } from "motion/react";
import { enterScale, spring, travel } from "../tokens/motion.ts";
import { fadeIn, fadeOut, reducedTransition } from "./transitions.ts";

/**
 * How a `Presence` arrives: `"fade"`, `"rise"` (up 8px), `"pop"` (from 97% scale), `"toast"` (up 8px, a
 * little quicker than `"rise"`) or `"menu"` (from 97% scale, a little quicker than `"pop"`). Every preset
 * leaves with a quick fade.
 */
export type PresencePreset = "fade" | "rise" | "pop" | "toast" | "menu";

/** The three states of an enter-and-exit animation. */
export interface PresenceMotion {
  /** Where it starts before it arrives. */
  readonly initial: TargetAndTransition;
  /** Where it settles, with the enter transition. */
  readonly animate: TargetAndTransition;
  /** Where it goes as it leaves, with the exit transition. */
  readonly exit: TargetAndTransition;
}

const leave: TargetAndTransition = { opacity: 0, transition: fadeOut };

/** Motion for each `Presence` preset, also used by the `buttery` factory's `enter`. */
export const presencePresets: Readonly<Record<PresencePreset, PresenceMotion>> =
  {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: fadeIn },
      exit: leave,
    },
    rise: {
      initial: { opacity: 0, y: travel.rise },
      animate: {
        opacity: 1,
        y: 0,
        transition: { default: spring.smooth, opacity: fadeIn },
      },
      exit: leave,
    },
    pop: {
      initial: { opacity: 0, scale: enterScale },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { default: spring.smooth, opacity: fadeIn },
      },
      exit: leave,
    },
    toast: {
      initial: { opacity: 0, y: travel.rise },
      animate: {
        opacity: 1,
        y: 0,
        transition: { default: spring.snappy, opacity: fadeIn },
      },
      exit: leave,
    },
    menu: {
      initial: { opacity: 0, scale: enterScale },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { default: spring.snappy, opacity: fadeIn },
      },
      exit: leave,
    },
  };

/**
 * Every preset under reduced motion: a 100ms fade. It still names the resting transform, so content that
 * was mid-entrance when motion became reduced lands in place.
 */
export const reducedPresence: PresenceMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, y: 0, scale: 1, transition: reducedTransition },
  exit: { opacity: 0, transition: reducedTransition },
};
