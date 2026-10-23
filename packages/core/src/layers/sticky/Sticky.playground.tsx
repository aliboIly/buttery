import { Inline, Stack, Sticky, Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";

export const page: DocsPage = {
  section: "foundations",
  title: "Sticky",
  description:
    "Keeps content at the top or bottom of its scroll container and publishes the height it takes.",
  order: 150,
  status: "stable",
  since: "0.2.0",
  home: "foundations/layers",
};

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
  {
    title: "Aside",
    description:
      "A sidebar sticks under the nav without adding to --bt-sticky-top, so anchors and lanes only clear the nav.",
    render: () => (
      <Surface
        level="card"
        role="region"
        aria-label="Aside demo"
        tabIndex={0}
        style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
      >
        <Sticky>
          <Surface level="raised" padX={4} padY={3} radius="xs">
            <Text variant="label">Nav</Text>
          </Surface>
        </Sticky>
        <Inline align="start" gap={6} padX={4}>
          <Sticky variant="aside">
            <Stack gap={2} padY={3}>
              <Text variant="label">On this page</Text>
              <Text variant="caption">Setup</Text>
              <Text variant="caption">Export</Text>
            </Stack>
          </Sticky>
          <Stack gap={3} padY={3}>
            {Array.from({ length: 24 }, (_, index) => (
              <Text key={index}>Paragraph {index + 1}</Text>
            ))}
          </Stack>
        </Inline>
      </Surface>
    ),
  },
];
