import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";

/** A label that truncates in a narrow row and keeps its full text in a tooltip. */
export function TruncatedLabel(): ReactElement {
  return (
    <Surface level="card" padX={4} padY={3}>
      <Inline gap={2}>
        <Text truncate>Background for the spring launch card</Text>
        <Text variant="badge" tabular>
          135°
        </Text>
      </Inline>
    </Surface>
  );
}
