import { useMemo } from "react";
import type { Ref, RefCallback } from "react";

/** Combines refs into one callback ref that sets each of them and cleans them all up. */
export function mergeRefs<T>(
  ...refs: readonly (Ref<T> | undefined)[]
): RefCallback<T> {
  return (value) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") {
        const cleanup = ref(value);
        return typeof cleanup === "function"
          ? cleanup
          : () => {
              ref(null);
            };
      }
      if (ref) {
        ref.current = value;
        return () => {
          ref.current = null;
        };
      }
      return undefined;
    });
    return () => {
      for (const cleanup of cleanups) cleanup?.();
    };
  };
}

/** Merges a caller's ref with a component's own, kept stable so React doesn't reattach them every render. */
export function useMergedRefs<T>(
  first: Ref<T> | undefined,
  second: Ref<T> | undefined,
): RefCallback<T> {
  return useMemo(() => mergeRefs(first, second), [first, second]);
}
