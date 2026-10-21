import type { ReactElement } from "react";
import { ChartFrame } from "@buttery/react";

/** Green coffee on hand as a filled area, with the reorder level as a gray line over it. */
export function StockAgainstTarget(): ReactElement {
  return (
    <ChartFrame
      label="Green coffee on hand"
      labels={["Jun", "Jul", "Aug", "Sep", "Oct"]}
      series={[
        {
          key: "stock",
          label: "On hand",
          values: [2600, 2280, 1940, 2410, 2140],
        },
        {
          key: "reorder",
          label: "Reorder level",
          values: [2000, 2000, 2000, 2000, 2000],
          color: "chart-muted",
        },
      ]}
      formatValue={(kilograms) => `${kilograms.toLocaleString()} kg`}
      size="lg"
      labelsHeading="Month"
    >
      <ChartFrame.Area series="stock" />
      <ChartFrame.Line series="stock" />
      <ChartFrame.Line series="reorder" />
    </ChartFrame>
  );
}
