import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";

/** Label and value pairs in a column, each pair with its own tighter gap. */
export function FormFields(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text variant="label">Title</Text>
          <Text variant="body">Spring launch</Text>
        </Stack>
        <Stack gap={1}>
          <Text variant="label">Canvas</Text>
          <Text variant="body">Square, 1080 × 1080</Text>
        </Stack>
      </Stack>
    </Surface>
  );
}
