import type { ReactElement } from "react";
import { Divider, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A deck's slides and who it's shared with in one card, split into two groups by a divider. */
export function GroupedList(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Text variant="label">Title slide</Text>
        <Text variant="label">Q3 in numbers</Text>
        <Divider />
        <Text variant="label">Shared with the design team</Text>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Shared with the design team");
};
