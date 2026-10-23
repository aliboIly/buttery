import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { BarChart, SegmentedControl, Switch } from "@buttery/react";
import type { ChartSeries, ChartSize } from "@buttery/react";

const BLENDS = ["House", "Espresso", "Decaf", "Single origin"];

const OCTOBER: ChartSeries = {
  key: "october",
  label: "October",
  values: [320, 260, 90, 140],
};

const SEPTEMBER: ChartSeries = {
  key: "september",
  label: "September",
  values: [290, 270, 85, 110],
  comparison: true,
};

const HEIGHTS: Readonly<Record<ChartSize, string>> = {
  sm: "160px",
  md: "220px",
  lg: "300px",
};

/** Bags sold per blend at each size, alone or with last month's bars in gray beside this month's. */
export function SizeAndComparison(): ReactElement {
  const [size, setSize] = useState<ChartSize>("md");
  const [compare, setCompare] = useState(false);
  return (
    <Stack gap={3}>
      <Inline gap={4} align="center" wrap>
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
        <Switch
          label="Compare with September"
          checked={compare}
          onCheckedChange={setCompare}
        />
      </Inline>
      <Text variant="caption">
        {`${HEIGHTS[size]} tall, ${compare ? "October beside September" : "October only"}`}
      </Text>
      <BarChart
        label="Bags sold by blend"
        labels={BLENDS}
        labelsHeading="Blend"
        series={compare ? [OCTOBER, SEPTEMBER] : [OCTOBER]}
        size={size}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("220px tall, October only");
  await press("switch", "Compare with September");
  await see("220px tall, October beside September");
  await press("radio", "Small");
  await see("160px tall, October beside September");
};
