import { createContext, use, useEffect, useMemo, useRef } from "react";
import type { Context } from "react";
import { spring } from "../tokens/motion.ts";
import { useMotionPreference } from "./preference.ts";
import { trackAnimation } from "./settle.ts";

/** Whether animations here count toward buttery's settled flag. `Loop` turns it off for its content. */
export const AnimationTrackingContext: Context<boolean> = createContext(true);

const UNTRACKED: AnimationTracking = {
  onAnimationStart: () => undefined,
  onAnimationComplete: () => undefined,
  onLayoutAnimationStart: () => undefined,
  onLayoutAnimationComplete: () => undefined,
};

/** Handlers for a Motion component's animation and layout-animation events. */
export interface AnimationTracking {
  readonly onAnimationStart: () => void;
  readonly onAnimationComplete: () => void;
  readonly onLayoutAnimationStart: () => void;
  readonly onLayoutAnimationComplete: () => void;
}

/** The longest a buttery animation runs, in ms: twice the visual duration of the longest spring. */
const ANIMATION_LIMIT =
  2000 *
  Math.max(
    ...Object.values(spring).map((value) =>
      "visualDuration" in value ? value.visualDuration : 0,
    ),
  );

interface Releases {
  values: (() => void) | null;
  layout: (() => void) | null;
}

/**
 * Reports a Motion component's animations to buttery's settled flag: spread the handlers onto the
 * component, and layout checks wait until it comes to rest. Its own animations and its layout animation
 * are reported apart, so one finishing doesn't settle the other. Unmounting mid-animation ends both.
 */
export function useAnimationTracking(): AnimationTracking {
  const tracked = use(AnimationTrackingContext);
  const reduced = useMotionPreference() === "reduced";
  const releases = useRef<Releases>({ values: null, layout: null });

  // Reduced motion turns layout animation off and cuts the component's own animations short. Motion finishes
  // a running one in some engines and drops it without reporting its end in others, so a hold that outlives
  // the longest animation lets go of whatever is still held.
  useEffect(() => {
    if (!reduced) return undefined;
    const timer = window.setTimeout(() => {
      releases.current.values?.();
      releases.current.layout?.();
      releases.current = { values: null, layout: null };
    }, ANIMATION_LIMIT);
    return () => {
      window.clearTimeout(timer);
    };
  }, [reduced]);

  useEffect(
    () => () => {
      releases.current.values?.();
      releases.current.layout?.();
      releases.current = { values: null, layout: null };
    },
    [],
  );

  return useMemo((): AnimationTracking => {
    if (!tracked) return UNTRACKED;
    const start = (kind: keyof Releases) => (): void => {
      releases.current[kind] ??= trackAnimation();
    };
    const complete = (kind: keyof Releases) => (): void => {
      releases.current[kind]?.();
      releases.current[kind] = null;
    };
    return {
      onAnimationStart: start("values"),
      onAnimationComplete: complete("values"),
      onLayoutAnimationStart: start("layout"),
      onLayoutAnimationComplete: complete("layout"),
    };
  }, [tracked]);
}
