import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { EmptyState } from "@buttery/react";

/** A list that has nothing in it yet, with no action to take. */
export function EmptyList(): ReactElement {
  return (
    <EmptyState
      title="No refunds yet"
      description="Refunds you give show up here."
      titleAs="h3"
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("No refunds yet");
  await see("Refunds you give show up here.");
};
