import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ChartFrame, SegmentedControl } from "@buttery/react";

const MONTHS = ["October", "November"] as const;

type Month = (typeof MONTHS)[number];

const REFUNDS: Readonly<Record<Month, readonly (number | null)[]>> = {
  October: [3, 1, 4, 2],
  November: [null, null, null, null],
};

/** Refunds per week: switching months shows the loading pill, and a month with no refunds yet shows the empty state. */
export function RefundsByWeek(): ReactElement {
  const [month, setMonth] = useState<Month>("October");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  return (
    <Stack gap={3}>
      <SegmentedControl
        label="Month"
        options={MONTHS}
        value={month}
        onValueChange={(next) => {
          setMonth(next);
          setLoading(true);
        }}
      />
      <ChartFrame
        label={`Refunds in ${month}`}
        labels={["Week 1", "Week 2", "Week 3", "Week 4"]}
        labelsHeading="Week"
        series={[{ key: "refunds", label: "Refunds", values: REFUNDS[month] }]}
        layout="band"
        loading={loading}
        loadingLabel="Loading refunds"
        emptyLabel="No refunds yet this month"
        size="sm"
      >
        <ChartFrame.Bars />
      </ChartFrame>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "November");
  await see("Loading refunds");
  await see("No refunds yet this month");
};
