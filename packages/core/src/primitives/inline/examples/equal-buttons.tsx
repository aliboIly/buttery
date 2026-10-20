import type { ReactElement } from "react";
import { Inline, Pressable, Surface, Text } from "@buttery/core";

/** Two actions sharing the width equally, whatever their labels. */
export function EqualButtons(): ReactElement {
  return (
    <Inline gap={2} uniform>
      <Pressable asChild>
        <Surface level="raised" padX={4} padY={3}>
          <Text variant="button">Previous</Text>
        </Surface>
      </Pressable>
      <Pressable asChild>
        <Surface level="raised" padX={4} padY={3}>
          <Text variant="button">Finish the tour</Text>
        </Surface>
      </Pressable>
    </Inline>
  );
}
