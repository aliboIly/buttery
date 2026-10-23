import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Pressable,
  Stack,
  Surface,
  Text,
  TextStack,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const DECKS = ["Spring launch", "Team offsite", "Board update"] as const;

/** A panel's empty state, centered, with its title as a paragraph because the panel already has its heading. */
export function EmptyCopy(): ReactElement {
  const [saved, setSaved] = useState(0);
  return (
    <Surface level="card" pad={4}>
      <Stack gap={4}>
        <Inline gap={2} justify="between">
          <Text variant="title" asChild>
            <h3>Saved decks</h3>
          </Text>
          <Surface asChild level="raised" padX={4} padY={2} radius="full">
            <Pressable
              aria-disabled={saved === DECKS.length}
              onClick={() => {
                setSaved(saved + 1);
              }}
            >
              <Text variant="button">Save a deck</Text>
            </Pressable>
          </Surface>
        </Inline>
        {saved === 0 ? (
          <Center padY={8}>
            <TextStack
              size="empty"
              align="center"
              titleAs="p"
              title="Nothing saved yet"
              body="Decks you save show up here, ready to present or share."
            />
          </Center>
        ) : (
          <Stack gap={2}>
            {DECKS.slice(0, saved).map((deck) => (
              <Text key={deck}>{deck}</Text>
            ))}
          </Stack>
        )}
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Nothing saved yet");
  await press("button", "Save a deck");
  await see("Spring launch");
};
