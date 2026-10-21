import { Inline, Text } from "@buttery/core";
import type { ReactElement } from "react";
import { Sparkline } from "@buttery/react";

/** Two weeks of orders as a sparkline that fills the row beside the total it adds up to. */
export function OrdersTrend(): ReactElement {
  return (
    <Inline gap={3} align="center">
      <Text variant="title-md" tabular>
        1,284
      </Text>
      <Sparkline
        label="Orders, last 14 days"
        values={[42, 38, 51, 47, 63, 71, 58, 64, 69, 66, 72, 80, 77, 85]}
      />
    </Inline>
  );
}
