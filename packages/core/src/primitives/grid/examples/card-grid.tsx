import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

function cards(count: number): string {
  return count === 1 ? "1 card" : `${String(count)} cards`;
}

/** A board's three columns as equal cards with the 16px card gap: stacked when narrow, three across from 640px. */
export function CardGrid(): ReactElement {
  const [inReview, setInReview] = useState(1);
  const columns = [
    { title: "Draft", count: 3 },
    { title: "Review", count: inReview },
    { title: "Done", count: 13 - inReview },
  ];
  return (
    <Stack gap={4}>
      <Grid columns={{ base: 1, md: 3 }} gap={4}>
        {columns.map(({ title, count }) => (
          <Surface key={title} level="card" pad={4}>
            <Stack gap={2}>
              <Text variant="label">{title}</Text>
              <Text variant="caption">{cards(count)}</Text>
            </Stack>
          </Surface>
        ))}
      </Grid>
      <Inline>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            aria-disabled={inReview === 0}
            onClick={() => {
              setInReview(0);
            }}
          >
            <Text variant="button">Approve the card in review</Text>
          </Pressable>
        </Surface>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("12 cards");
  await press("button", "Approve the card in review");
  await see("13 cards");
};
