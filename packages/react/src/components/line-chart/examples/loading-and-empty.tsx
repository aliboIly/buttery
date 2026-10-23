import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { LineChart, SegmentedControl } from "@butteryui/react";

type Range = "This week" | "Today";

const DATA: Readonly<
  Record<Range, { labels: string[]; values: (number | null)[] }>
> = {
  "This week": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [1420, 1560, 1490, 1710, 1880, 2240, 2105],
  },
  Today: {
    labels: ["8:00", "10:00", "12:00", "14:00", "16:00"],
    values: [null, null, null, null, null],
  },
};

/** A chart's loading and empty states: a pill over its box while a range loads, then a line when there's nothing to draw. */
export function LoadingAndEmpty(): ReactElement {
  const [range, setRange] = useState<Range>("This week");
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
      <SegmentedControl<Range>
        label="Range"
        options={["This week", "Today"]}
        value={range}
        onValueChange={(next) => {
          setRange(next);
          setLoading(true);
        }}
      />
      <LineChart
        label="Sales"
        labels={DATA[range].labels}
        series={[{ key: "sales", label: "Sales", values: DATA[range].values }]}
        loading={loading}
        loadingLabel="Loading sales"
        emptyLabel="No sales yet today"
        size="sm"
      />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Today");
  await see("Loading sales");
  await see("No sales yet today");
};
