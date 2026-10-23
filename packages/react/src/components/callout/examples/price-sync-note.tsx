import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Callout } from "@butteryui/react";

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
