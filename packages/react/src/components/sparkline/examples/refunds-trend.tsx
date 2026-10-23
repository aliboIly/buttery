import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Sparkline } from "@butteryui/react";

/** Refunds over two weeks in the rose chart color, with a gap for days with no data. */
export function RefundsTrend(): ReactElement {
  return (
    <Inline gap={3} align="center">
      <Text tone="secondary">Refunds</Text>
      <Sparkline
        label="Refunds, last 14 days"
        values={[3, 1, 2, null, null, 2, 1, 0, 0, 1, 0, 0, 1, 0]}
        color="chart-5"
      />
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Refunds");
};
