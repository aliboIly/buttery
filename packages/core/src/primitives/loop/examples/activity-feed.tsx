import { useState } from "react";
import type { ReactElement } from "react";
import {
  Inline,
  Loop,
  Morph,
  Presence,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const TOTALS = ["1,204", "1,318", "1,472"] as const;

const ROWS = [
  { deck: "Spring launch", when: "1 hr ago" },
  { deck: "Team offsite", when: "12 min ago" },
  { deck: "Board update", when: "2 min ago" },
  { deck: "Hiring plan", when: "just now" },
] as const;

/** A bento card's living demo: the total ticks and a row arrives on each step, with a button to pause it for people reading nearby. */
export function ActivityFeed(): ReactElement {
  const [paused, setPaused] = useState(false);
  return (
    <Surface level="card" pad={4} style={{ blockSize: "var(--bt-bento-row)" }}>
      <Stack gap={4}>
        <Inline gap={2} justify="between">
          <Text variant="label">Decks presented today</Text>
          <Surface asChild level="raised" padX={3} padY={1} radius="full">
            <Pressable
              onClick={() => {
                setPaused(!paused);
              }}
            >
              <Text variant="button">{paused ? "Play" : "Pause"}</Text>
            </Pressable>
          </Surface>
        </Inline>
        <Loop steps={TOTALS.length} paused={paused} aria-hidden="true">
          {(step) => (
            <Stack gap={4}>
              <Morph contentKey={step}>
                <Text variant="heading-2" tabular>
                  {TOTALS[step]}
                </Text>
              </Morph>
              <Stack gap={2}>
                {ROWS.map(({ deck, when }, index) => (
                  <Presence key={deck} show={index <= step + 1} preset="rise">
                    <Surface level="raised" padX={3} padY={2}>
                      <Inline gap={2} justify="between">
                        <Text variant="body-sm">{deck}</Text>
                        <Text variant="caption">{when}</Text>
                      </Inline>
                    </Surface>
                  </Presence>
                ))}
              </Stack>
            </Stack>
          )}
        </Loop>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1,204");
  await press("button", "Pause");
  await see("Play");
  await press("button", "Play");
  await see("Pause");
};
