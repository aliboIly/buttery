import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AreaChart, SegmentedControl } from "@buttery/react";
import type { ChartSize } from "@buttery/react";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const WHERE: Readonly<Record<ChartSize, string>> = {
  sm: "160px tall, for a card beside other numbers",
  md: "220px tall, the default, for a section of a page",
  lg: "300px tall, for a report",
};

/** The three sizes on a chart of wholesale revenue, each for where it fits: a card, a page section or a report. */
export function Sizes(): ReactElement {
  const [size, setSize] = useState<ChartSize>("md");
  return (
    <Stack gap={3}>
      <Stack gap={2} align="start">
        <SegmentedControl
          label="Chart size"
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          value={size}
          onValueChange={setSize}
        />
        <Text variant="caption">{WHERE[size]}</Text>
      </Stack>
      <AreaChart
        label="Wholesale revenue"
        labels={["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
        labelsHeading="Month"
        series={[
          {
            key: "wholesale",
            label: "Wholesale",
            values: [4200, 4650, 4400, 5100, 5350, 5900, 6240],
          },
        ]}
        formatValue={(value) => dollars.format(value)}
        size={size}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("220px tall, the default, for a section of a page");
  await press("radio", "Large");
  await see("300px tall, for a report");
  await press("radio", "Small");
  await see("160px tall, for a card beside other numbers");
};
