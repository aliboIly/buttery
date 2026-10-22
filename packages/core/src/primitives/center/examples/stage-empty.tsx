import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A stage that holds its empty state in the middle, and then the card that takes its place. */
export function StageEmpty(): ReactElement {
  const [hasCard, setHasCard] = useState(false);
  return (
    <Stack gap={3}>
      <Surface level="section" pad={8}>
        <Center style={{ blockSize: "var(--bt-bento-row)" }}>
          {hasCard ? (
            <Surface level="card" padX={8} padY={6}>
              <Text variant="title">Untitled card</Text>
            </Surface>
          ) : (
            <Stack gap={3} align="center">
              <Text variant="title">Your canvas is empty</Text>
              <Text variant="body-sm">
                Start a fresh card, or open one from your library.
              </Text>
            </Stack>
          )}
        </Center>
      </Surface>
      <Inline>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            onClick={() => {
              setHasCard(!hasCard);
            }}
          >
            <Text variant="button">
              {hasCard ? "Clear the stage" : "Start a card"}
            </Text>
          </Pressable>
        </Surface>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Start a card");
  await see("Untitled card");
  await press("button", "Clear the stage");
  await see("Your canvas is empty");
};
