import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AreaChart } from "@buttery/react";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Monthly subscription revenue as a filled area, with last year's as a gray line, so each month shows its change. */
export function SubscriptionRevenue(): ReactElement {
  return (
    <AreaChart
      label="Subscription revenue"
      summary="Up 35% on last October."
      labels={["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
      labelsHeading="Month"
      series={[
        {
          key: "now",
          label: "This year",
          values: [9850, 10300, 10100, 10750, 11200, 11600, 12150],
        },
        {
          key: "before",
          label: "Last year",
          values: [7400, 7900, 7800, 8200, 8500, 8700, 9000],
          comparison: true,
        },
      ]}
      formatValue={(value) => dollars.format(value)}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("slider", "Subscription revenue");
  await key("End");
  await see("+35%");
  await key("ArrowLeft");
  await see("+33.3%");
};
