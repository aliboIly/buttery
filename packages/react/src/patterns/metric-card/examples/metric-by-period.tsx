import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { MetricCard, SegmentedControl } from "@buttery/react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PERIODS = {
  this: {
    value: "$12,405.00",
    delta: 0.124,
    values: [1420, 1560, 1490, 1710, 1880, 2240, 2105],
    before: [1350, 1410, 1380, 1550, 1700, 1960, 1890],
  },
  last: {
    value: "$11,240.00",
    delta: -0.031,
    values: [1350, 1410, 1380, 1550, 1700, 1960, 1890],
    before: [1400, 1450, 1420, 1600, 1760, 1990, 1980],
  },
} as const;

type Period = keyof typeof PERIODS;

/** A card whose value, change and chart come from state, picked here by the period above it. */
export function MetricByPeriod(): ReactElement {
  const [period, setPeriod] = useState<Period>("this");
  const shown = PERIODS[period];
  return (
    <Stack gap={4}>
      <SegmentedControl
        label="Period"
        options={[
          { value: "this", label: "This week" },
          { value: "last", label: "Last week" },
        ]}
        value={period}
        onValueChange={setPeriod}
      />
      <MetricCard
        title="Sales"
        value={shown.value}
        delta={shown.delta}
        deltaLabel="vs the week before"
        labels={DAYS}
        series={[
          { key: "now", label: "This period", values: shown.values },
          {
            key: "before",
            label: "The week before",
            values: shown.before,
            comparison: true,
          },
        ]}
        updated="Updated 4 min ago"
      />
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("$12,405.00");
  await press("radio", "Last week");
  await see("$11,240.00");
};
