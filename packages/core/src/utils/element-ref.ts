import type { Ref } from "react";

/**
 * Narrows a ref typed for any element to the element a component actually renders. Safe because React
 * only ever writes the rendered element, which is always an `HTMLElement`, into the ref; TypeScript treats
 * `RefObject` as invariant and can't see that.
 */
export function elementRef<T extends HTMLElement>(
  ref: Ref<HTMLElement> | undefined,
): Ref<T> | undefined {
  return ref as Ref<T> | undefined;
}
