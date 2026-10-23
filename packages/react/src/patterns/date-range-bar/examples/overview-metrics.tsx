import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { DateRangeBar, MetricCard } from "@butteryui/react";
import type { DateRangePreset, DateRangeValue } from "@butteryui/react";

interface Figures {
  readonly revenue: string;
  readonly orders: string;
}

const FIGURES: Readonly<Record<DateRangePreset, Figures>> = {
  today: { revenue: "$412.00", orders: "9" },
  "last-7-days": { revenue: "$3,180.00", orders: "71" },
  "last-4-weeks": { revenue: "$12,480.00", orders: "284" },
  "last-3-months": { revenue: "$36,920.00", orders: "851" },
  "last-12-months": { revenue: "$151,300.00", orders: "3,412" },
  "month-to-date": { revenue: "$8,760.00", orders: "198" },
  "year-to-date": { revenue: "$118,040.00", orders: "2,690" },
  custom: { revenue: "$5,215.00", orders: "117" },
};

/** An overview's period over its metric cards: a new range changes their numbers, and No comparison drops the change. */
export function OverviewMetrics(): ReactElement {
  const [period, setPeriod] = useState<DateRangeValue>({
    range: "last-7-days",
    interval: "daily",
    comparison: "previous-period",
  });
  const figures = FIGURES[period.range];
  const compared = period.comparison !== "none";
  return (
    <Stack gap={4}>
      <DateRangeBar value={period} onValueChange={setPeriod} />
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <MetricCard
          title="Revenue"
          value={figures.revenue}
          compared={compared}
          delta={compared ? 0.124 : undefined}
        />
        <MetricCard
          title="Orders"
          value={figures.orders}
          compared={compared}
          delta={compared ? 0.061 : undefined}
        />
      </Grid>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("combobox", "Date range, Last 7 days");
  await press("option", "Last 4 weeks");
  await see("$12,480.00");
  await see("284");
};
