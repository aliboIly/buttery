import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Stagger, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SegmentedControl, SplitHero } from "@buttery/react";

const THEMES = ["Plain", "Paper", "Ink"] as const;

type Theme = (typeof THEMES)[number];

/** An opening band whose visual is a slide to try: pick a theme under it and the slide takes it. */
export function HeroWithALiveCard(): ReactElement {
  const [theme, setTheme] = useState<Theme>("Paper");
  return (
    <SplitHero
      eyebrow="Deckhand"
      title="Decks that look designed."
      titleMore="Pick a theme and see the slide take it."
      actions={
        <>
          <Button asChild variant="primary" arrow="forward">
            <a href="#new-deck">Start a deck</a>
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
                <Text variant="title">Quarterly review</Text>
                <Text variant="caption" tone="secondary">
                  {`Theme · ${theme}`}
                </Text>
              </Stack>
            </Surface>
          </Stagger.Item>
          <Stagger.Item>
            <SegmentedControl<Theme>
              label="Theme"
              options={THEMES}
              value={theme}
              onValueChange={setTheme}
            />
          </Stagger.Item>
        </>
      }
    />
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Theme · Paper");
  await press("radio", "Ink");
  await see("Theme · Ink");
};
