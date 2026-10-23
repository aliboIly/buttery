import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { LineChart, SegmentedControl } from "@butteryui/react";
import type { ChartSeries, ChartSize } from "@butteryui/react";

type Lines = "One" | "Compared" | "By channel";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SERIES: Readonly<Record<Lines, readonly ChartSeries[]>> = {
  One: [
    {
      key: "orders",
      label: "Orders",
      values: [38, 42, 40, 47, 51, 63, 58],
    },
  ],
  Compared: [
    {
      key: "orders",
      label: "This week",
      values: [38, 42, 40, 47, 51, 63, 58],
    },
    {
      key: "before",
      label: "Last week",
      values: [35, 39, 41, 44, 46, 57, 55],
      comparison: true,
    },
  ],
  "By channel": [
    {
      key: "web",
      label: "Web shop",
      values: [21, 24, 22, 27, 29, 38, 34],
      color: "chart-1",
    },
    {
      key: "cafe",
      label: "Café",
      values: [12, 13, 13, 14, 16, 19, 18],
      color: "chart-2",
    },
    {
      key: "wholesale",
      label: "Wholesale",
      values: [5, 5, 5, 6, 6, 6, 6],
      color: "chart-3",
    },
  ],
};

const SHOWN: Readonly<Record<Lines, string>> = {
  One: "One series",
  Compared: "This week over last week's gray line",
  "By channel": "Three channels, each in its own color",
};

const HEIGHTS: Readonly<Record<ChartSize, string>> = {
  sm: "160px",
  md: "220px",
  lg: "300px",
};

/** One line, a line over last week's in gray, or a line per channel in the chart colors, at each of the three sizes. */
export function LinesAndSizes(): ReactElement {
  const [lines, setLines] = useState<Lines>("One");
  const [size, setSize] = useState<ChartSize>("md");
  return (
    <Stack gap={3}>
      <Inline gap={4} align="center" wrap>
        <SegmentedControl<Lines>
          label="Lines"
          options={["One", "Compared", "By channel"]}
          value={lines}
          onValueChange={setLines}
        />
        <SegmentedControl
          label="Chart size"
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          value={size}
          onValueChange={setSize}
        />
      </Inline>
      <Text variant="caption">{`${SHOWN[lines]}, ${HEIGHTS[size]} tall`}</Text>
      <LineChart
        label="Orders"
        labels={DAYS}
        labelsHeading="Day"
        series={SERIES[lines]}
        size={size}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("One series, 220px tall");
  await press("radio", "Compared");
  await see("This week over last week's gray line, 220px tall");
  await press("radio", "By channel");
  await press("radio", "Large");
  await see("Three channels, each in its own color, 300px tall");
};
