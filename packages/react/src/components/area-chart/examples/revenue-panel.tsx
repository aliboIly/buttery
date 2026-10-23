import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AreaChart, SegmentedControl } from "@butteryui/react";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const PERIODS = {
  Quarter: {
    labels: ["Aug", "Sep", "Oct"],
    values: [11200, 11600, 12150],
  },
  Year: {
    labels: [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
    ],
    values: [
      8200, 8650, 9100, 8900, 9400, 9850, 10300, 10100, 10750, 11200, 11600,
      12150,
    ],
  },
};

type Period = keyof typeof PERIODS;

/** A revenue panel: the period switch changes both the total and the chart under it. */
export function RevenuePanel(): ReactElement {
  const [period, setPeriod] = useState<Period>("Quarter");
  const { labels, values } = PERIODS[period];
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Inline gap={3} align="center" justify="between">
          <Text variant="label">Subscription revenue</Text>
          <SegmentedControl
            label="Period"
            options={["Quarter", "Year"]}
            value={period}
            onValueChange={setPeriod}
          />
        </Inline>
        <Stack gap={3}>
          <Text variant="title-lg" tabular>
            {dollars.format(total)}
          </Text>
          <Text variant="caption">{`Total for the ${period.toLowerCase()}`}</Text>
        </Stack>
        <AreaChart
          label={`Subscription revenue, last ${period.toLowerCase()}`}
          labels={labels}
          labelsHeading="Month"
          series={[{ key: "revenue", label: "Revenue", values }]}
          formatValue={(value) => dollars.format(value)}
          size="sm"
        />
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("$34,950");
  await press("radio", "Year");
  await see("$120,200");
};
