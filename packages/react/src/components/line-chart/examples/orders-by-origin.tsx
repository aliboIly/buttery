import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Checkbox, LineChart } from "@butteryui/react";
import type { ChartSeries } from "@butteryui/react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ORIGINS: readonly ChartSeries[] = [
  {
    key: "ethiopia",
    label: "Ethiopia",
    values: [22, 25, 23, 28, 30, 35, 33],
    color: "chart-1",
  },
  {
    key: "colombia",
    label: "Colombia",
    values: [16, 18, 17, 19, 21, 24, 23],
    color: "chart-2",
  },
  {
    key: "brazil",
    label: "Brazil",
    values: [12, 12, 14, 13, 16, 18, 17],
    color: "chart-3",
  },
];

/** A dashboard card of orders per origin, with a checkbox per origin that shows or hides its line. */
export function OrdersByOrigin(): ReactElement {
  const [shown, setShown] = useState<readonly string[]>(
    ORIGINS.map((origin) => origin.key),
  );
  const series = ORIGINS.filter((origin) => shown.includes(origin.key));
  return (
    <Surface level="card" pad={4}>
      <Stack gap={4}>
        <Inline gap={3} align="center" justify="between">
          <Text variant="title-sm">Orders by origin</Text>
          <Text variant="caption" tone="secondary">
            {`${String(series.length)} of ${String(ORIGINS.length)} origins`}
          </Text>
        </Inline>
        <LineChart
          label="Orders by origin"
          labels={DAYS}
          labelsHeading="Day"
          series={series}
        />
        <Inline gap={4} wrap>
          {ORIGINS.map((origin) => (
            <Checkbox
              key={origin.key}
              label={origin.label}
              checked={shown.includes(origin.key)}
              onCheckedChange={(checked) => {
                setShown(
                  checked === true
                    ? [...shown, origin.key]
                    : shown.filter((key) => key !== origin.key),
                );
              }}
            />
          ))}
        </Inline>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Brazil");
  await see("2 of 3 origins");
  await press("checkbox", "Brazil");
  await see("3 of 3 origins");
};
