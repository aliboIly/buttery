import type { ReactElement } from "react";
import { Divider, Stack, Surface, Text } from "@buttery/core";

/** Two groups of settings in one card, split by a divider. */
export function GroupedList(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Text variant="label">Export as PNG</Text>
        <Text variant="label">Export as JPEG</Text>
        <Divider />
        <Text variant="label">Copy to clipboard</Text>
      </Stack>
    </Surface>
  );
}
