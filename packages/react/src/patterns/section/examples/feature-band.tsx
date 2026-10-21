import type { ReactElement } from "react";
import { Grid, Surface, Text } from "@buttery/core";
import { Section } from "@buttery/react";

const FEATURES = ["Finish", "Backdrop", "Placement"] as const;

/** A titled band with three equal tiles. */
export function FeatureBand(): ReactElement {
  return (
    <Section
      title="Everything a card needs"
      body="A finish, a backdrop, a lean and an anchor, all in one panel."
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
