import type { ReactElement } from "react";
import { Stagger, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SplitHero } from "@butteryui/react";

/** A roastery's home page opening on the palette tint, which sets the band apart from the page under it. */
export function TintedHero(): ReactElement {
  return (
    <SplitHero
      variant="tinted"
      eyebrow="Halfmoon Roastery"
      title="Coffee roasted on Thursday."
      titleMore="At your door by Saturday."
      body="Small batches from three farms we visit every year."
      actions={
        <>
          <Button asChild variant="primary" arrow="forward">
            <a href="#coffees">Choose a coffee</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="#subscriptions">See subscriptions</a>
          </Button>
        </>
      }
      visual={
        <>
          <Stagger.Item>
            <Surface level="card" pad={8}>
              <Text variant="title">Guji, Ethiopia</Text>
            </Surface>
          </Stagger.Item>
          <Stagger.Item>
            <Surface level="card" pad={4}>
              <Text variant="label">Roasted Thursday · Light</Text>
            </Surface>
          </Stagger.Item>
        </>
      }
    />
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Coffee roasted on Thursday.");
  await see("Choose a coffee");
};
