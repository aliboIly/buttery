import type { ReactElement } from "react";
import { Stack, Sticky, Surface, Text } from "@buttery/core";

/** A section title that stays at the top of its scrolling panel. */
export function ScrollHeader(): ReactElement {
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Recent cards"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <Sticky>
        <Surface level="card" padX={4} padY={3}>
          <Text variant="label">Recent cards</Text>
        </Surface>
      </Sticky>
      <Stack gap={3} padX={4} padY={3}>
        {Array.from({ length: 20 }, (_, index) => (
          <Text key={index}>Card {index + 1}</Text>
        ))}
      </Stack>
    </Surface>
  );
}
