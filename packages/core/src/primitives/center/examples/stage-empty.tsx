import type { ReactElement } from "react";
import { Center, Stack, Surface, Text } from "@buttery/core";

/** An empty state held in the middle of a stage-like area. */
export function StageEmpty(): ReactElement {
  return (
    <Surface level="section" pad={8}>
      <Center>
        <Stack gap={3} align="center">
          <Text variant="title">Your canvas is empty</Text>
          <Text variant="body-sm">
            Bring in a photo, or start from a blank card.
          </Text>
        </Stack>
      </Center>
    </Surface>
  );
}
