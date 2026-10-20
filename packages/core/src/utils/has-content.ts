import type { ReactNode } from "react";

/** Whether a React node renders anything: not `undefined`, `null`, `false` or an empty string. */
export function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}
