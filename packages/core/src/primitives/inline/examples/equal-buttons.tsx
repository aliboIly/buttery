import type { ReactElement } from "react";
import { Center, Inline, Pressable, Surface, Text } from "@buttery/core";

/** Two actions sharing the width equally, whatever their labels. */
export function EqualButtons(): ReactElement {
  return (
    <Inline gap={2} uniform>
      {["Previous", "Finish the tour"].map((label) => (
        <Surface key={label} asChild level="raised" padX={4} padY={3}>
          <Center asChild>
            <Pressable>
              <Text variant="button">{label}</Text>
            </Pressable>
          </Center>
        </Surface>
      ))}
    </Inline>
  );
}
