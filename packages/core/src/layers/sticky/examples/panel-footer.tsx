import type { ReactElement } from "react";
import { Inline, Stack, Sticky, Surface, Text } from "@buttery/core";

/** Actions that stay at the bottom of a scrolling panel. */
export function PanelFooter(): ReactElement {
  return (
    <Surface
      level="card"
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <Stack gap={3} padX={4} padY={3}>
        {Array.from({ length: 20 }, (_, index) => (
          <Text key={index}>Layer {index + 1}</Text>
        ))}
      </Stack>
      <Sticky edge="bottom">
        <Surface level="card" padX={4} padY={3}>
          <Inline justify="end">
            <Text variant="button">Export</Text>
          </Inline>
        </Surface>
      </Sticky>
    </Surface>
  );
}
