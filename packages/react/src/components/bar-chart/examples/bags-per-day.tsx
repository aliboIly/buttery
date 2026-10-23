import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { BarChart } from "@butteryui/react";

/** Bags roasted each day this week beside last week; pointing at a day, or stepping with the arrow keys, shows the change. */
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("slider", "Bags roasted");
  await key("End");
  await see("+8.2%");
  await key("ArrowLeft");
  await see("+5.7%");
};
