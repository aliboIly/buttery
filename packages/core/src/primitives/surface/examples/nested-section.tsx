import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";

/** A panel holding a section whose card nests with concentric corners. */
export function NestedSection(): ReactElement {
  return (
    <Surface level="panel">
      <Surface level="section">
        <Stack>
          <Inline padX={4} padY={2}>
            <Text variant="control" tone="secondary">
              Backdrop
            </Text>
          </Inline>
          <Surface radius="auto" padX={4} padY={4}>
            <Text>Fill</Text>
          </Surface>
        </Stack>
      </Surface>
    </Surface>
  );
}
