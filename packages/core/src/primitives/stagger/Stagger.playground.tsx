import { Grid, Stagger, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";

export const page: DocsPage = {
  section: "motion",
  title: "Stagger",
  description:
    "Brings a group of items in one after another the first time it scrolls into view.",
  order: 160,
  status: "stable",
  since: "0.3.0",
  home: "motion/presets",
};

const CARDS = [
  "Templates",
  "Themes",
  "Pictures",
  "Exports",
  "Sharing",
  "History",
] as const;

export const demos: readonly DemoSection[] = [
  {
    title: "Arriving cards",
    description:
      "The cards rise in 50ms apart the first time the grid is in view; the whole entrance stays under 900ms.",
    render: () => (
      <Grid columns={{ base: 2, md: 3 }} gap={4} asChild>
        <Stagger>
          {CARDS.map((card) => (
            <Stagger.Item key={card}>
              <Surface level="card" pad={6}>
                <Text variant="title">{card}</Text>
              </Surface>
            </Stagger.Item>
          ))}
        </Stagger>
      </Grid>
    ),
  },
];
