import type { ReactElement } from "react";
import { Grid, Stack, Stagger, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const FEATURES = [
  { title: "Templates", body: "Start from a layout that already works." },
  { title: "Themes", body: "Your colors and fonts on every slide." },
  { title: "Exports", body: "A PDF of the deck or a PNG of each slide." },
] as const;

/** A landing page's features, stacked when narrow and three across from 640px, arriving one after another. */
export function FeatureGrid(): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 3 }} gap={4} asChild>
      <Stagger>
        {FEATURES.map((feature) => (
          <Stagger.Item key={feature.title}>
            <Surface level="card" pad={6}>
              <Stack gap={2}>
                <Text variant="title">{feature.title}</Text>
                <Text variant="body">{feature.body}</Text>
              </Stack>
            </Surface>
          </Stagger.Item>
        ))}
      </Stagger>
    </Grid>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Themes");
  await see("A PDF of the deck or a PNG of each slide.");
};
