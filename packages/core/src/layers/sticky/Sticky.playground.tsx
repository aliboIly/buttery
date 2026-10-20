import { Stack, Sticky, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Stacked stickies",
    description:
      "A sub nav sticks under the nav; the panel publishes their total as --bt-sticky-top.",
    render: () => (
      <Surface
        level="card"
        role="region"
        aria-label="Stacked stickies demo"
        tabIndex={0}
        style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
      >
        <Sticky>
          <Surface level="raised" padX={4} padY={3} radius="xs">
            <Text variant="label">Nav</Text>
          </Surface>
        </Sticky>
        <Sticky>
          <Surface level="section" padX={4} padY={2} radius="xs">
            <Text variant="control">Sub nav</Text>
          </Surface>
        </Sticky>
        <Stack gap={3} padX={4} padY={3}>
          {Array.from({ length: 24 }, (_, index) => (
            <Text key={index}>Row {index + 1}</Text>
          ))}
        </Stack>
      </Surface>
    ),
  },
];
