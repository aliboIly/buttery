import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { Chip } from "@buttery/react";

/** A section title with a small action at its end. */
export function ClearAll(): ReactElement {
  return (
    <Inline gap={2} align="center" justify="between">
      <Text variant="control">Effects</Text>
      <Chip>Clear all</Chip>
    </Inline>
  );
}
