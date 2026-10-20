import type { ReactElement } from "react";
import { FloatingLanes, Stack, Surface, Text } from "@buttery/core";

/** A notice in the top-end lane. */
export function UpdateNotice(): ReactElement {
  return (
    <FloatingLanes.Item lane="top-end">
      <Surface level="floating" pad={4} role="status">
        <Stack gap={1}>
          <Text variant="label">Update ready</Text>
          <Text variant="caption">Restart to get the new export options.</Text>
        </Stack>
      </Surface>
    </FloatingLanes.Item>
  );
}
