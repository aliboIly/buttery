import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { MetricCard } from "@buttery/react";

const DAYS = [
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** One metric: its title and what it means, the value and its change, both weeks charted, and a link to its details. */
export function SalesMetric(): ReactElement {
  return (
    <MetricCard
      title="Sales"
      info="Every sale, before refunds and fees."
      value="$12,405.00"
      delta={0.124}
      labels={DAYS}
      series={[
        {
          key: "now",
          label: "This week",
          values: [1420, 1560, 1490, 1710, 1880, 2240, 2105],
        },
        {
          key: "before",
          label: "Last week",
          values: [1350, 1410, 1380, 1550, 1700, 1960, 1890],
          comparison: true,
        },
      ]}
      formatValue={(value) => dollars.format(value)}
      updated="Updated 4 min ago"
      href="#reports-sales"
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("$12,405.00");
  await press("button", "Every sale, before refunds and fees.");
  await see("Every sale, before refunds and fees.");
};
