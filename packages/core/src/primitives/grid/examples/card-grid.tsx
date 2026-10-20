import type { ReactElement } from "react";
import { Grid, Stack, Surface, Text } from "@buttery/core";

const CARDS = [
  { title: "Draft", detail: "3 cards" },
  { title: "Review", detail: "1 card" },
  { title: "Done", detail: "12 cards" },
] as const;

/** Three equal cards with the 16px card gap. */
export function CardGrid(): ReactElement {
  return (
    <Grid columns={3} gap={4}>
      {CARDS.map((card) => (
        <Surface key={card.title} level="card" pad={4}>
          <Stack gap={2}>
            <Text variant="label">{card.title}</Text>
            <Text variant="caption">{card.detail}</Text>
          </Stack>
        </Surface>
      ))}
    </Grid>
  );
}
