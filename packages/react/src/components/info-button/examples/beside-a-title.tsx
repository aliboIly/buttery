import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { InfoButton } from "@buttery/react";

/** A card's title with an info button after it, 4px apart and centered on the title's line. */
export function InfoBesideATitle(): ReactElement {
  return (
    <Inline gap={1} align="center">
      <Text variant="title-sm">Open orders</Text>
      <InfoButton info="Orders paid for and not yet shipped." />
    </Inline>
  );
}
