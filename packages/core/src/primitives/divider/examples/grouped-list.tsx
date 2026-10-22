import type { ReactElement } from "react";
import { Divider, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** An order's bags and its delivery in one card, split into two groups by a divider. */
export function GroupedList(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Text variant="label">Ethiopia Guji, 250 g</Text>
        <Text variant="label">Colombia Huila, 1 kg</Text>
        <Divider />
        <Text variant="label">Ships on Friday</Text>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Ships on Friday");
};
