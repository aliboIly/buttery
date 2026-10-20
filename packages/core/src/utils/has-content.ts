import type { ReactNode } from "react";

/**
 * Whether a React node renders anything: not `undefined`, `null`, a boolean, an empty string, or a list
 * of only those (such as `.map()` over an empty array).
 */
export function hasContent(node: ReactNode): boolean {
  if (Array.isArray(node))
    return node.some((child: ReactNode) => hasContent(child));
  return (
    node !== undefined &&
    node !== null &&
    typeof node !== "boolean" &&
    node !== ""
  );
}
