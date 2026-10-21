import type { ReactElement } from "react";
import { AreaChart } from "@buttery/react";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Monthly subscription revenue over half a year. */
export function SubscriptionRevenue(): ReactElement {
  return (
    <AreaChart
      label="Subscription revenue"
      labels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
      labelsHeading="Month"
      series={[
        {
          key: "revenue",
          label: "Revenue",
          values: [10300, 10100, 10750, 11200, 11600, 12150],
        },
      ]}
      formatValue={(value) => dollars.format(value)}
    />
  );
}
