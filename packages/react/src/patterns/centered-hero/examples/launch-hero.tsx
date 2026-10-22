import { useState } from "react";
import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, CenteredHero, Page } from "@buttery/react";

const SAMPLES = ["Spring launch", "Summer menu", "Open studio night"];

/** A launch page's opening band: a link to start, and a button that swaps the sample card in the visual. */
export function LaunchHero(): ReactElement {
  const [sample, setSample] = useState(0);
  return (
    <Page>
      <CenteredHero
        eyebrow="Card studio"
        title="One card."
        titleMore="Every size it needs."
        body="Make a launch card once, then export it for posts, stories and slides."
        actions={
          <>
            <Button asChild variant="primary" arrow="forward">
              <a href="#new-card">Start a card</a>
            </Button>
            <Button
              onClick={() => {
                setSample((sample + 1) % SAMPLES.length);
              }}
            >
              See another card
            </Button>
          </>
        }
        visual={
          <Surface level="section" pad={12}>
            <Text variant="title">{SAMPLES[sample]}</Text>
          </Surface>
        }
      />
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Spring launch");
  await press("button", "See another card");
  await see("Summer menu");
};
