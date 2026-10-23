import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Callout } from "@buttery/react";

/** A note that belongs with the content around it, there from the start, so it needs no role. */
export function PriceSyncNote(): ReactElement {
  return (
    <Callout title="Wholesale prices stay in sync">
      A change here shows up on every café&apos;s order form.
    </Callout>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Wholesale prices stay in sync");
};
