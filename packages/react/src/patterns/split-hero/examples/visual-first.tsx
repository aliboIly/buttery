import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import { SplitHero } from "@buttery/react";

/** The visual on the start side, for a band that answers the one above it. */
export function VisualFirst(): ReactElement {
  return (
    <SplitHero
      visualSide="start"
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
