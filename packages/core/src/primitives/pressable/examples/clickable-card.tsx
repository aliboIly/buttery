import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";

/** A whole card that opens on click, with press feedback and a focus ring. */
export function ClickableCard(): ReactElement {
  return (
    <Pressable asChild>
      <Surface
        level="card"
        pad={4}
        role="button"
        tabIndex={0}
        aria-label="Open Spring launch"
      >
        <Stack gap={1}>
          <Text variant="label">Spring launch</Text>
          <Text variant="caption">Edited today</Text>
        </Stack>
      </Surface>
    </Pressable>
  );
}
