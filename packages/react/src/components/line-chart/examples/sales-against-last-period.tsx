import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
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

/** A week of sales against the week before, in dollars; Tab to the chart, then the arrow keys step through the days. */
export function SalesAgainstLastPeriod(): ReactElement {
  return (
    <LineChart
      label="Sales"
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ key, see }) => {
  await key("Tab");
  await see("+11.4%");
  await key("ArrowLeft");
  await see("+14.3%");
};
