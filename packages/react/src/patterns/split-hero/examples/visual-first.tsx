import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SplitHero } from "@buttery/react";

/** The visual on the start side, for a band that answers the one above it. */
export function VisualFirst(): ReactElement {
  return (
    <SplitHero
      visualSide="start"
      titleAs="h2"
      title="Lean it."
      titleMore="Turn a card in 3D with one small pad."
      visual={
        <Surface level="card" pad={8}>
          <Text variant="title">Launch card</Text>
        </Surface>
      }
    />
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Lean it.");
  await see("Turn a card in 3D with one small pad.");
};
