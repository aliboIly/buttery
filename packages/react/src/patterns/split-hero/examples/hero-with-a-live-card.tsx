import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Stagger, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SegmentedControl, SplitHero } from "@buttery/react";

const FINISHES = ["Clear", "Paper", "Ink"] as const;

type Finish = (typeof FINISHES)[number];

/** An opening band whose visual is a card to try: pick a finish under it and the card takes it. */
export function HeroWithALiveCard(): ReactElement {
  const [finish, setFinish] = useState<Finish>("Paper");
  return (
    <SplitHero
      eyebrow="Card Studio"
      title="Cards that look finished."
      titleMore="Pick a finish and see the card take it."
      actions={
        <>
          <Button asChild variant="primary" arrow="forward">
            <a href="#studio">Open the studio</a>
          </Button>
          <Button asChild variant="soft">
            <a href="#gallery">See the gallery</a>
          </Button>
        </>
      }
      visual={
        <>
          <Stagger.Item>
            <Surface level="card" pad={8}>
              <Stack gap={2}>
                <Text variant="title">Launch card</Text>
                <Text variant="caption" tone="secondary">
                  {`Finish · ${finish}`}
                </Text>
              </Stack>
            </Surface>
          </Stagger.Item>
          <Stagger.Item>
            <SegmentedControl<Finish>
              label="Finish"
              options={FINISHES}
              value={finish}
              onValueChange={setFinish}
            />
          </Stagger.Item>
        </>
      }
    />
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Finish · Paper");
  await press("radio", "Ink");
  await see("Finish · Ink");
};
