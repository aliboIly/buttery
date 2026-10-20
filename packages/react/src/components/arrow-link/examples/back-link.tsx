import type { ReactElement } from "react";
import { ArrowLink } from "@buttery/react";

/** A way back to the page above, with the arrow pointing back. */
export function BackLink(): ReactElement {
  return (
    <ArrowLink href="#/button" arrow="back">
      All components
    </ArrowLink>
  );
}
