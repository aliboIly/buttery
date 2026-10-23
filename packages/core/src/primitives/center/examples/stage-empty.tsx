import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A stage that holds its empty state in the middle, and then the slide that takes its place. */
export function StageEmpty(): ReactElement {
  const [hasSlide, setHasSlide] = useState(false);
  return (
    <Stack gap={3}>
      <Surface level="section" pad={8}>
        <Center style={{ blockSize: "var(--bt-bento-row)" }}>
          {hasSlide ? (
            <Surface level="card" padX={8} padY={6}>
              <Text variant="title">Untitled slide</Text>
            </Surface>
          ) : (
            <Stack gap={3} align="center">
              <Text variant="title">Your canvas is empty</Text>
              <Text variant="body-sm">
                Add a slide, or open a deck from your library.
              </Text>
            </Stack>
          )}
        </Center>
      </Surface>
      <Inline>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            onClick={() => {
              setHasSlide(!hasSlide);
            }}
          >
            <Text variant="button">
              {hasSlide ? "Clear the stage" : "Add a slide"}
            </Text>
          </Pressable>
        </Surface>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a slide");
  await see("Untitled slide");
  await press("button", "Clear the stage");
  await see("Your canvas is empty");
};
