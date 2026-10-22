import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A title and description stacked with the empty-state gap. */
export function EmptyStateCopy(): ReactElement {
  return (
    <Stack gap={3} align="center">
      <Text variant="title">Your canvas is empty</Text>
      <Text variant="body-sm">
        Start a fresh card, or open one from your library.
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Your canvas is empty");
};
