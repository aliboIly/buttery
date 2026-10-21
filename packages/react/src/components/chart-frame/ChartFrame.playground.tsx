import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ChartFrame } from "@buttery/react";
import type { ChartSeries } from "@buttery/react";

const DAYS = [
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

const orders: ChartSeries = {
  key: "orders",
  label: "Orders",
  values: [42, 38, 51, 47, 63, 71, 58],
};

const bags: ChartSeries = {
  key: "bags",
  label: "Bags roasted",
  values: [48, 40, 55, 52, 60, 74, 66],
};

export const demos: readonly DemoSection[] = [
  {
    title: "Bars and a line in one frame",
    description:
      "Point at a day, or focus the plot and use the arrow keys: the column, the dots and the tooltip move together.",
    render: () => (
      <ChartFrame
        label="Orders and bags roasted"
        summary="Both peaked on Oct 13."
        labels={DAYS}
        series={[orders, bags]}
        layout="band"
      >
        <ChartFrame.Bars series={["orders"]} />
        <ChartFrame.Line series="bags" />
      </ChartFrame>
    ),
  },
  {
    title: "No data and loading",
    description:
      "With nothing to draw, a dashed baseline and a caption; while loading, a pill over the same box after 300ms.",
    render: () => (
      <Stack gap={6}>
        <ChartFrame
          label="Refunds"
          size="sm"
          labels={DAYS}
          series={[
            { key: "refunds", label: "Refunds", values: DAYS.map(() => null) },
          ]}
        />
        <ChartFrame
          label="Refunds"
          size="sm"
          labels={DAYS}
          series={[orders]}
          loading
        />
      </Stack>
    ),
  },
];
