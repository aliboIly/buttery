import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A panel holding a section whose card nests with concentric corners. */
export function NestedSection(): ReactElement {
  return (
    <Surface level="panel">
      <Surface level="section">
        <Stack>
          <Inline padX={4} padY={2}>
            <Text variant="control" tone="secondary">
              Background
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

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Background");
  await see("Fill");
};
