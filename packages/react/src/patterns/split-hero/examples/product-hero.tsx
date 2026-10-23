import type { ReactElement } from "react";
import { Stagger, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SplitHero } from "@butteryui/react";

/** A product's opening band with one call to action and a visual of two pieces. */
export function ProductHero(): ReactElement {
  return (
    <SplitHero
      title="Decks that look designed."
      titleMore="Write the slides, pick a theme, and present."
      actions={
        <Button asChild variant="primary" arrow="forward">
          <a href="#new-deck">Start a deck</a>
        </Button>
      }
      visual={
        <>
          <Stagger.Item>
            <Surface level="card" pad={8}>
              <Text variant="title">Quarterly review</Text>
            </Surface>
          </Stagger.Item>
          <Stagger.Item>
            <Surface level="section" pad={4}>
              <Text variant="label">Theme · Ink</Text>
            </Surface>
          </Stagger.Item>
        </>
      }
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Decks that look designed.");
  await see("Start a deck");
};
