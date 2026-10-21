import type { ReactElement } from "react";
import { BarChart } from "@buttery/react";

/** Bags roasted each day this week, beside last week. */
export function BagsPerDay(): ReactElement {
  return (
    <BarChart
      label="Bags roasted"
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      labelsHeading="Day"
      series={[
        {
          key: "now",
          label: "This week",
          values: [48, 40, 55, 52, 60, 74, 66],
        },
        {
          key: "before",
          label: "Last week",
          values: [44, 42, 50, 49, 58, 70, 61],
          comparison: true,
        },
      ]}
    />
  );
}
