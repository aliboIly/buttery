import { createContext, use, useEffect, useMemo, useRef } from "react";
import type { Context } from "react";
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

/**
 * Reports a Motion component's animations to buttery's settled flag: spread the handlers onto the
 * component, and layout checks wait until it comes to rest. Unmounting mid-animation ends the report.
 */
export function useAnimationTracking(): AnimationTracking {
  const tracked = use(AnimationTrackingContext);
  const release = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      release.current?.();
      release.current = null;
    },
    [],
  );

  return useMemo((): AnimationTracking => {
    if (!tracked) return UNTRACKED;
    const start = (): void => {
      release.current ??= trackAnimation();
    };
    const complete = (): void => {
      release.current?.();
      release.current = null;
    };
    return {
      onAnimationStart: start,
      onAnimationComplete: complete,
      onLayoutAnimationStart: start,
      onLayoutAnimationComplete: complete,
    };
  }, [tracked]);
}
