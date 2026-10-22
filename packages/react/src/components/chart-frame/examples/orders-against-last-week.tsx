import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ChartFrame } from "@buttery/react";

/** This week's orders as bars with last week's as a line over them, two marks in one frame, so each day shows its change. */
export function OrdersAgainstLastWeek(): ReactElement {
  return (
    <ChartFrame
      label="Orders"
      summary="Up on last week every day but Tuesday."
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      labelsHeading="Day"
      series={[
        {
          key: "now",
          label: "This week",
          values: [42, 38, 51, 47, 63, 71, 58],
        },
        {
          key: "before",
          label: "Last week",
          values: [39, 41, 46, 45, 60, 66, 50],
          comparison: true,
        },
      ]}
      layout="band"
    >
      <ChartFrame.Bars series={["now"]} />
      <ChartFrame.Line series="before" />
    </ChartFrame>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("slider", "Orders");
  await key("End");
  await see("+16%");
  await key("Home");
  await see("+7.7%");
};
