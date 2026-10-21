import type { ReactElement } from "react";
import { ChartFrame } from "@buttery/react";

/** Orders as bars with bags roasted as a line, in one frame. */
export function OrdersAndBags(): ReactElement {
  return (
    <ChartFrame
      label="Orders and bags roasted"
      summary="Both peaked on Saturday."
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      series={[
        {
          key: "orders",
          label: "Orders",
          values: [42, 38, 51, 47, 63, 71, 58],
        },
        {
          key: "bags",
          label: "Bags roasted",
          values: [48, 40, 55, 52, 60, 74, 66],
        },
      ]}
      layout="band"
      labelsHeading="Day"
    >
      <ChartFrame.Bars series={["orders"]} />
      <ChartFrame.Line series="bags" />
    </ChartFrame>
  );
}
