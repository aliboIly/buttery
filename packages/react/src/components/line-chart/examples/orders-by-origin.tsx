import type { ReactElement } from "react";
import { LineChart } from "@buttery/react";

/** Orders per origin over a week, three series in the chart colors. */
export function OrdersByOrigin(): ReactElement {
  return (
    <LineChart
      label="Orders by origin"
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      labelsHeading="Day"
      series={[
        {
          key: "ethiopia",
          label: "Ethiopia",
          values: [22, 25, 23, 28, 30, 35, 33],
        },
        {
          key: "colombia",
          label: "Colombia",
          values: [16, 18, 17, 19, 21, 24, 23],
        },
        {
          key: "brazil",
          label: "Brazil",
          values: [12, 12, 14, 13, 16, 18, 17],
        },
      ]}
    />
  );
}
