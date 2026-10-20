import type { ReactElement } from "react";
import { Callout } from "@buttery/react";

/** A note that belongs with the content around it, there from the start. */
export function ShareNote(): ReactElement {
  return (
    <Callout title="Shared cards stay in sync">
      Changes you make show up for everyone you&apos;ve shared with.
    </Callout>
  );
}
