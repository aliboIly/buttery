import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ChartFrame, SegmentedControl } from "@buttery/react";
import type { ChartSize } from "@buttery/react";

const HEIGHTS: Readonly<Record<ChartSize, string>> = {
  sm: "160px",
  md: "220px",
  lg: "300px",
};

/** The three sizes, on green coffee on hand as a filled area against the reorder level as a gray line. */
export function StockAgainstTarget(): ReactElement {
  const [size, setSize] = useState<ChartSize>("md");
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center" justify="between">
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
        <Text variant="caption">{`${HEIGHTS[size]} tall`}</Text>
      </Inline>
      <ChartFrame
        label="Green coffee on hand"
        labels={["Jun", "Jul", "Aug", "Sep", "Oct"]}
        labelsHeading="Month"
        series={[
          {
            key: "stock",
            label: "On hand",
            values: [2600, 2280, 1940, 2410, 2140],
          },
          {
            key: "reorder",
            label: "Reorder level",
            values: [2000, 2000, 2000, 2000, 2000],
            comparison: true,
          },
        ]}
        formatValue={(kilograms) => `${kilograms.toLocaleString()} kg`}
        size={size}
      >
        <ChartFrame.Area series="stock" />
        <ChartFrame.Line series="stock" />
        <ChartFrame.Line series="reorder" />
      </ChartFrame>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("220px tall");
  await press("radio", "Large");
  await see("300px tall");
  await press("radio", "Small");
  await see("160px tall");
};
