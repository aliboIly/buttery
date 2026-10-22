import { Grid, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Sparkline } from "@buttery/react";
import type { ChartColor } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "Sparkline",
  description:
    "A trend at a glance: one small line, no axes, its last point marked, for a table row or beside a number.",
  order: 140,
  status: "new",
  since: "0.8.0",
};

const ROWS: readonly {
  readonly name: string;
  readonly total: string;
  readonly values: readonly (number | null)[];
  readonly color?: ChartColor;
}[] = [
  {
    name: "Orders",
    total: "1,284",
    values: [42, 38, 51, 47, 63, 71, 58, 64, 69, 66, 72, 80, 77, 85],
  },
  {
    name: "Refunds",
    total: "12",
    values: [3, 1, 2, 0, 1, 2, 1, 0, 0, 1, 0, 0, 1, 0],
    color: "chart-5",
  },
  {
    name: "New subscribers",
    total: "96",
    values: [5, 6, 6, null, null, 7, 8, 7, 9, 8, 10, 9, 11, 12],
  },
];

type Trend = "rising" | "falling" | "gaps";

const TREND_NAMES: readonly [Trend, ...Trend[]] = ["rising", "falling", "gaps"];

const TRENDS: Readonly<Record<Trend, readonly (number | null)[]>> = {
  rising: [42, 38, 51, 47, 63, 71, 58, 64, 69, 66, 72, 80, 77, 85],
  falling: [85, 81, 83, 74, 70, 72, 61, 58, 60, 52, 47, 49, 41, 38],
  gaps: [5, 6, 6, null, null, 7, 8, 7, 9, 8, 10, 9, 11, 12],
};

const COLORS: readonly [ChartColor, ...ChartColor[]] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

export const live: LiveDemo = {
  controls: {
    values: { kind: "choice", options: TREND_NAMES, initial: "rising" },
    color: { kind: "choice", options: COLORS, initial: "chart-1" },
  },
  render: ({ values, color }) => (
    <Sparkline
      label="Orders, last 14 days"
      values={TRENDS[demoChoice(values, TREND_NAMES)]}
      color={demoChoice(color, COLORS)}
    />
  ),
  code: ({ values, color }) =>
    [
      "<Sparkline",
      '  label="Orders, last 14 days"',
      `  values={[${TRENDS[demoChoice(values, TREND_NAMES)].map(String).join(", ")}]}`,
      `  color="${demoChoice(color, COLORS)}"`,
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Beside their numbers",
    description:
      "Each fills its column; the last value is marked and a missing day leaves a gap.",
    render: () => (
      <Grid columns={3} gap={4} align="center">
        {ROWS.map((row) => [
          <Text key={`${row.name}-name`} tone="secondary">
            {row.name}
          </Text>,
          <Text key={`${row.name}-total`} tabular>
            {row.total}
          </Text>,
          <Sparkline
            key={`${row.name}-trend`}
            label={`${row.name}, last 14 days`}
            values={row.values}
            color={row.color}
          />,
        ])}
      </Grid>
    ),
  },
];
