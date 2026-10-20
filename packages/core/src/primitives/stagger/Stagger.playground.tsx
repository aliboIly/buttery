import { Grid, Stagger, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

const CARDS = [
  "Templates",
  "Brand kits",
  "Photos",
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
      <Grid columns={3} gap={4} asChild>
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
