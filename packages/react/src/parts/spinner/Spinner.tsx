import { useMotionPreference } from "@butteryui/core";
import type { ReactElement } from "react";

/** A small turning ring centered over a control that's busy. It holds still with reduced motion. */
export function Spinner(): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  return (
    <span
      className="bt-spinner"
      data-bt-part="spinner"
      data-motion={reduced ? "reduced" : undefined}
      aria-hidden="true"
    />
  );
}
