import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { BarChart } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "BarChart",
  description:
    "Values per period or category as bars, side by side for each series, with a column that highlights on hover.",
  order: 30,
  status: "new",
  since: "0.8.0",
};

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const THIS_WEEK = [48, 40, 55, 52, 60, 74, 66];
const LAST_WEEK = [44, 42, 50, 49, 58, 70, 61];

export const live: LiveDemo = {
  controls: {
    size: { kind: "choice", options: ["sm", "md", "lg"], initial: "md" },
    loading: { kind: "toggle", initial: false },
  },
  render: ({ size, loading }) => (
    <BarChart
      label="Bags roasted"
      labels={WEEK}
      labelsHeading="Day"
      series={[
        { key: "now", label: "This week", values: THIS_WEEK },
        {
          key: "before",
          label: "Last week",
          values: LAST_WEEK,
          comparison: true,
        },
      ]}
      size={demoChoice(size, ["md", "sm", "lg"])}
      loading={loading === true}
    />
  ),
  code: ({ size, loading }) =>
    [
      "<BarChart",
      '  label="Bags roasted"',
      `  labels={${JSON.stringify(WEEK)}}`,
      '  labelsHeading="Day"',
      "  series={[",
      `    { key: "now", label: "This week", values: ${JSON.stringify(THIS_WEEK)} },`,
      `    { key: "before", label: "Last week", values: ${JSON.stringify(LAST_WEEK)}, comparison: true },`,
      "  ]}",
      `  size="${demoChoice(size, ["md", "sm", "lg"])}"`,
      ...(loading === true ? ["  loading"] : []),
      "/>",
    ].join("\n"),
};

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
