import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A card's details as label and value pairs: the column keeps its rhythm as a note joins, and each pair keeps its tighter gap. */
export function FormFields(): ReactElement {
  const [note, setNote] = useState(false);
  return (
    <Surface level="card" pad={4}>
      <Stack gap={4} align="start">
        <Stack gap={1}>
          <Text variant="label">Title</Text>
          <Text variant="body">Spring launch</Text>
        </Stack>
        <Stack gap={1}>
          <Text variant="label">Canvas</Text>
          <Text variant="body">Square, 1080 × 1080</Text>
        </Stack>
        {note ? (
          <Stack gap={1}>
            <Text variant="label">Note</Text>
            <Text variant="body">Print a second copy for the shop window.</Text>
          </Stack>
        ) : null}
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            onClick={() => {
              setNote(!note);
            }}
          >
            <Text variant="button">
              {note ? "Remove the note" : "Add a note"}
            </Text>
          </Pressable>
        </Surface>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a note");
  await see("Print a second copy for the shop window.");
  await press("button", "Remove the note");
  await see("Add a note");
};
