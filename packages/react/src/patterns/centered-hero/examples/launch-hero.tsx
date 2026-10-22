import { useState } from "react";
import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, CenteredHero, Page } from "@buttery/react";

const SAMPLES = ["Spring launch", "Quarterly review", "Team offsite"];

/** A launch page's opening band: a link to start, and a button that swaps the sample deck in the visual. */
export function LaunchHero(): ReactElement {
  const [sample, setSample] = useState(0);
  return (
    <Page>
      <CenteredHero
        eyebrow="Deckhand"
        title="One deck."
        titleMore="Ready for the room and the inbox."
        body="Write the slides once, then present them full screen or send them as a PDF."
        actions={
          <>
            <Button asChild variant="primary" arrow="forward">
              <a href="#new-deck">Start a deck</a>
            </Button>
            <Button
              onClick={() => {
                setSample((sample + 1) % SAMPLES.length);
              }}
            >
              See another deck
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
  await press("button", "See another deck");
  await see("Quarterly review");
};
