import { Grid, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Sparkline } from "@buttery/react";
import type { ChartColor } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "Sparkline",
  description:
    "A trend at a glance: one small line, no axes, its last point marked, for a table row or beside a number.",
  order: 140,
  status: "new",
  since: "0.7.0",
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
