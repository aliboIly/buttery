import type { ReactElement } from "react";
import { Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SplitHero } from "@butteryui/react";

/** The visual on the start side, for a band that answers the one above it. */
export function VisualFirst(): ReactElement {
  return (
    <SplitHero
      visualSide="start"
      titleAs="h2"
      title="Tilt it."
      titleMore="Turn a picture in 3D with one small pad."
      visual={
        <Surface level="card" pad={8}>
          <Text variant="title">Quarterly review</Text>
        </Surface>
      }
    />
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Tilt it.");
  await see("Turn a picture in 3D with one small pad.");
};
