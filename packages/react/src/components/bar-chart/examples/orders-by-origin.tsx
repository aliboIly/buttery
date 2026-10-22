import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { BarChart, SegmentedControl } from "@buttery/react";

const ORIGINS = ["Ethiopia", "Colombia", "Brazil", "Kenya", "Guatemala"];

const MONTHS = ["October", "September"] as const;

type Month = (typeof MONTHS)[number];

const ORDERS: Readonly<Record<Month, readonly number[]>> = {
  October: [412, 318, 254, 141, 96],
  September: [341, 362, 231, 158, 88],
};

/** A dashboard card of orders per origin, one bar per category, with a month switch and the leader written out. */
export function OrdersByOrigin(): ReactElement {
  const [month, setMonth] = useState<Month>("October");
  const values = ORDERS[month];
  const most = Math.max(...values);
  const leader = ORIGINS[values.indexOf(most)] ?? "";
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Inline gap={3} align="center" justify="between">
          <Text variant="title">Orders by origin</Text>
          <SegmentedControl
            label="Month"
            options={MONTHS}
            value={month}
            onValueChange={setMonth}
          />
        </Inline>
        <Text variant="caption">{`${leader} led with ${String(most)} orders`}</Text>
        <BarChart
          label={`Orders by origin in ${month}`}
          labels={ORIGINS}
          labelsHeading="Origin"
          series={[{ key: "orders", label: "Orders", values }]}
          size="sm"
        />
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Ethiopia led with 412 orders");
  await press("radio", "September");
  await see("Colombia led with 362 orders");
};
