import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { BarChart, SegmentedControl } from "@buttery/react";

type Week = "This week" | "Next week";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const ROASTS: Readonly<Record<Week, readonly (number | null)[]>> = {
  "This week": [48, 40, 55, 52, 60],
  "Next week": [null, null, null, null, null],
};

/** A chart's loading and empty states: a pill while a week's roasts load, then a line when none are planned yet. */
export function RoastSchedule(): ReactElement {
  const [week, setWeek] = useState<Week>("This week");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  return (
    <Stack gap={4}>
      <SegmentedControl<Week>
        label="Week"
        options={["This week", "Next week"]}
        value={week}
        onValueChange={(next) => {
          setWeek(next);
          setLoading(true);
        }}
      />
      <BarChart
        label={`Bags roasted, ${week.toLowerCase()}`}
        labels={DAYS}
        labelsHeading="Day"
        series={[{ key: "bags", label: "Bags", values: ROASTS[week] }]}
        loading={loading}
        loadingLabel="Loading roasts"
        emptyLabel="No roasts planned yet"
        size="sm"
      />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Next week");
  await see("Loading roasts");
  await see("No roasts planned yet");
  await press("radio", "This week");
  await see("Mon");
};
