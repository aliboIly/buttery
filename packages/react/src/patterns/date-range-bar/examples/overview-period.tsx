import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { useState } from "react";
import type { ReactElement } from "react";
import { DateRangeBar } from "@buttery/react";
import type { DateRangeValue } from "@buttery/react";

function query(period: DateRangeValue): string {
  const search = new URLSearchParams({
    range: period.range,
    interval: period.interval,
    compare: period.comparison,
  });
  if (period.custom !== undefined) {
    search.set("from", period.custom.start);
    search.set("to", period.custom.end);
  }
  return search.toString();
}

/** The period an overview shows, kept in state and turned into the query that fetches its numbers. */
export function OverviewPeriod(): ReactElement {
  const [period, setPeriod] = useState<DateRangeValue>({
    range: "last-4-weeks",
    interval: "weekly",
    comparison: "previous-period",
  });
  return (
    <Stack gap={3}>
      <DateRangeBar value={period} onValueChange={setPeriod} />
      <Text variant="caption" truncate>
        {`Fetching /api/overview?${query(period)}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Interval, Weekly");
  await press("option", "Monthly");
  await see(
    "Fetching /api/overview?range=last-4-weeks&interval=monthly&compare=previous-period",
  );
};
