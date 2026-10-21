import type { TargetAndTransition, Transition } from "motion/react";
import {
  durations,
  easingCurves,
  enterScale,
  spring,
  travel,
} from "../tokens/motion.ts";
import { fadeIn, fadeOut, reducedTransition } from "./transitions.ts";

/**
 * How a `Presence` arrives: `"fade"`, `"rise"` (up 8px), `"pop"` (from 97% scale), `"toast"` (up 8px, a
 * little quicker than `"rise"`), `"menu"` (from 97% scale, a little quicker than `"pop"`), `"dialog"` (from
 * 97% scale over `dur-fast`) or `"scrim"` (a fade over `dur-fast`, under a dialog). Every preset leaves
 * with a quick fade.
 */
export type PresencePreset =
  "fade" | "rise" | "pop" | "toast" | "menu" | "dialog" | "scrim";

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

/** A whole entrance over `dur-fast` on the enter curve, as dialogs and their scrim arrive. */
const quickIn: Transition = {
  duration: durations.fast / 1000,
  ease: easingCurves.out,
};

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
    dialog: {
      initial: { opacity: 0, scale: enterScale },
      animate: { opacity: 1, scale: 1, transition: quickIn },
      exit: leave,
    },
    scrim: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: quickIn },
      exit: leave,
    },
  };

/**
 * Every preset under reduced motion: a 100ms fade. Its targets start from wherever the values are, because
 * Motion only restarts a value whose target changes: content that was mid-entrance when motion became
 * reduced lands in place instead of finishing its spring.
 */
export const reducedPresence: PresenceMotion = {
  initial: { opacity: 0 },
  animate: {
    opacity: [null, 1],
    y: [null, 0],
    scale: [null, 1],
    transition: reducedTransition,
  },
  exit: { opacity: 0, transition: reducedTransition },
};
