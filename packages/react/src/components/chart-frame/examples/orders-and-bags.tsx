import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ChartFrame, SegmentedControl } from "@buttery/react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEKS = ["This week", "Last week"] as const;

type Week = (typeof WEEKS)[number];

const DATA: Readonly<
  Record<
    Week,
    { readonly orders: readonly number[]; readonly bags: readonly number[] }
  >
> = {
  "This week": {
    orders: [42, 38, 51, 47, 63, 71, 58],
    bags: [48, 40, 55, 52, 60, 74, 66],
  },
  "Last week": {
    orders: [39, 41, 46, 45, 68, 66, 50],
    bags: [44, 42, 50, 49, 70, 69, 61],
  },
};

/** A roastery dashboard card: orders as bars and bags roasted as a line in one frame, with a week switch and the busiest day. */
export function OrdersAndBags(): ReactElement {
  const [week, setWeek] = useState<Week>("This week");
  const { orders, bags } = DATA[week];
  const most = Math.max(...orders);
  const busiest = DAYS[orders.indexOf(most)] ?? "";
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Inline gap={3} align="center" justify="between">
          <Text variant="title">Orders and roasting</Text>
          <SegmentedControl
            label="Week"
            options={WEEKS}
            value={week}
            onValueChange={setWeek}
          />
        </Inline>
        <Text variant="caption">{`Busiest day: ${busiest}, ${String(most)} orders`}</Text>
        <ChartFrame
          label={`Orders and bags roasted, ${week.toLowerCase()}`}
          labels={DAYS}
          labelsHeading="Day"
          series={[
            { key: "orders", label: "Orders", values: orders },
            { key: "bags", label: "Bags roasted", values: bags },
          ]}
          layout="band"
        >
          <ChartFrame.Bars series={["orders"]} />
          <ChartFrame.Line series="bags" />
        </ChartFrame>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Busiest day: Sat, 71 orders");
  await press("radio", "Last week");
  await see("Busiest day: Fri, 68 orders");
};
