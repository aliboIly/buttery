import { Grid, Reveal, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";

export const page: DocsPage = {
  section: "motion",
  title: "Reveal",
  description:
    "Fades and lifts its content in the first time it scrolls into view.",
  order: 140,
  status: "stable",
  since: "0.3.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Scroll into view",
    description:
      "Each card waits below the fold and rises in with spring.gentle when 15% of it is visible. Cards already on screen when the page loads only fade.",
    render: () => (
      <Stack gap={4}>
        {["Templates", "Brand kits", "Exports"].map((title) => (
          <Reveal key={title}>
            <Surface level="card" pad={6}>
              <Grid columns={2} gap={4}>
                <Text variant="title">{title}</Text>
                <Text variant="body">
                  Arrives once, the first time you scroll to it.
                </Text>
              </Grid>
            </Surface>
          </Reveal>
        ))}
      </Stack>
    ),
  },
];
