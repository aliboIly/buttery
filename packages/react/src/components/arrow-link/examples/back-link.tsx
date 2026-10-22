import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink } from "@buttery/react";

/** A way back to the page above, with the arrow pointing back. */
export function BackLink(): ReactElement {
  return (
    <ArrowLink href="#components" arrow="back">
      All components
    </ArrowLink>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("All components");
};
