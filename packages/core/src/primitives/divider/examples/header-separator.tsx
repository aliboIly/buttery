import type { ReactElement } from "react";
import { Divider, Inline, Text } from "@buttery/core";

/** The 24px vertical separator between two header clusters. */
export function HeaderSeparator(): ReactElement {
  return (
    <Inline gap={3}>
      <Text variant="title-sm">Spring launch</Text>
      <Divider orientation="vertical" length={6} decorative />
      <Text variant="control" tone="secondary">
        Saved
      </Text>
    </Inline>
  );
}
