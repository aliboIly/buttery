import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Callout } from "@buttery/react";

/** A note that belongs with the content around it, there from the start, so it needs no role. */
export function ShareNote(): ReactElement {
  return (
    <Callout title="Shared cards stay in sync">
      Changes you make show up for everyone you&apos;ve shared with.
    </Callout>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Shared cards stay in sync");
};
