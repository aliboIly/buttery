import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { buttery } from "@buttery/react";

/** A feature card that rises in as it mounts and lifts on hover, from one element. */
export function FeatureCard(): ReactElement {
  return (
    <buttery.article
      surface="card"
      pad={4}
      stack
      gap={2}
      enter="rise"
      hover="lift"
    >
      <Text variant="label">Brand kits</Text>
      <Text variant="caption">Your colors and fonts, one click away.</Text>
    </buttery.article>
  );
}
