import { Grid } from "@buttery/core";
import type { ReactElement } from "react";
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

/** Two headline numbers for the week, side by side from the md breakpoint. */
export function OverviewMetrics(): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      <MetricCard
        title="Total sales"
        info="Everything charged, before refunds and fees."
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
        updated="Updated just now"
        href="#reports-gross-volume"
      />
      <MetricCard
        title="Orders"
        value="412"
        delta={-0.031}
        labels={DAYS}
        series={[
          {
            key: "now",
            label: "This week",
            values: [52, 58, 55, 61, 63, 64, 59],
          },
          {
            key: "before",
            label: "Last week",
            values: [55, 60, 58, 62, 66, 64, 60],
            comparison: true,
          },
        ]}
        updated="Updated just now"
        href="#orders"
      />
    </Grid>
  );
}
