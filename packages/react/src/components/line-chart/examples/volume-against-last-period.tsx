import type { ReactElement } from "react";
import { LineChart } from "@buttery/react";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const shortDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

/** A week of total sales against the week before, in dollars. */
export function VolumeAgainstLastPeriod(): ReactElement {
  return (
    <LineChart
      label="Total sales"
      summary="Up 12% on last week."
      labels={[
        "Oct 8",
        "Oct 9",
        "Oct 10",
        "Oct 11",
        "Oct 12",
        "Oct 13",
        "Oct 14",
      ]}
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
      formatTick={(value) => shortDollars.format(value)}
      size="sm"
    />
  );
}
