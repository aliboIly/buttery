import type { ReactElement } from "react";
import { BarChart } from "@buttery/react";

/** Orders this month per origin: one bar per category. */
export function OrdersByOrigin(): ReactElement {
  return (
    <BarChart
      label="Orders by origin"
      labels={["Ethiopia", "Colombia", "Brazil", "Kenya", "Guatemala"]}
      labelsHeading="Origin"
      series={[
        { key: "orders", label: "Orders", values: [412, 318, 254, 141, 96] },
      ]}
      size="sm"
    />
  );
}
