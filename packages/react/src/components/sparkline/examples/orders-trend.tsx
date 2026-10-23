import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Sparkline } from "@butteryui/react";

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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("1,284");
};
