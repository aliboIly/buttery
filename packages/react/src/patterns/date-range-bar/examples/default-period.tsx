import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { DateRangeBar } from "@buttery/react";

/** With no props it keeps its own value, starting on the last 7 days, daily, against the previous period. */
export function DefaultPeriod(): ReactElement {
  return <DateRangeBar />;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key }) => {
  await press("combobox", "Interval, Daily");
  await press("option", "Weekly");
  await press("combobox", "Interval, Weekly");
  await key("Escape");
};
