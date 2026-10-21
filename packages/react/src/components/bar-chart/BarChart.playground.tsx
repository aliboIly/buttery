import type { DemoSection } from "@buttery/core";
import { BarChart } from "@buttery/react";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const demos: readonly DemoSection[] = [
  {
    title: "This week beside last week",
    description: "Point at a day to highlight its column and read both weeks.",
    render: () => (
      <BarChart
        label="Bags roasted"
        labels={WEEK}
        labelsHeading="Day"
        series={[
          {
            key: "now",
            label: "This week",
            values: [48, 40, 55, 52, 60, 74, 66],
          },
          {
            key: "before",
            label: "Last week",
            values: [44, 42, 50, 49, 58, 70, 61],
            comparison: true,
          },
        ]}
      />
    ),
  },
  {
    title: "Gains and losses",
    description: "Bars below zero round at their bottom end.",
    render: () => (
      <BarChart
        label="Net stock change"
        size="sm"
        labels={WEEK}
        labelsHeading="Day"
        series={[
          {
            key: "change",
            label: "Change",
            values: [120, -80, 60, -150, 210, -40, 90],
          },
        ]}
        formatValue={(kilograms) =>
          `${kilograms > 0 ? "+" : ""}${String(kilograms)} kg`
        }
      />
    ),
  },
];
