import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";

/** A whole card that opens on click, with press feedback and a focus ring. */
export function ClickableCard(): ReactElement {
  return (
    <Surface asChild level="card" pad={4}>
      <Pressable asChild>
        <a href="#/surface">
          <Stack gap={2}>
            <Text variant="label">Spring launch</Text>
            <Text variant="caption">Edited today</Text>
          </Stack>
        </a>
      </Pressable>
    </Surface>
  );
}
