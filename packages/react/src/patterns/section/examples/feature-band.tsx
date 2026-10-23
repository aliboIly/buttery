import type { ReactElement } from "react";
import { Grid, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Section } from "@butteryui/react";

const FEATURES = ["Theme", "Background", "Layout"] as const;

/** A titled band with three equal tiles. */
export function FeatureBand(): ReactElement {
  return (
    <Section
      title="Everything a slide needs"
      body="A theme, a background, a layout and speaker notes, all in one panel."
    >
      <Grid columns={{ base: 1, md: 3 }} gap={4}>
        {FEATURES.map((feature) => (
          <Surface key={feature} level="section" pad={6}>
            <Text variant="label">{feature}</Text>
          </Surface>
        ))}
      </Grid>
    </Section>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Everything a slide needs");
  await see("Background");
};
