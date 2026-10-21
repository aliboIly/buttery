import { Grid } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { MetricCard } from "@buttery/react";

const DAYS = Array.from({ length: 14 }, (_, day) => `Oct ${String(day + 1)}`);
const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const shortDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

const volume = {
  title: "Sales",
  info: "Every sale, before refunds and fees.",
  value: "$23,405.00",
  delta: 0.094,
  labels: DAYS,
  series: [
    {
      key: "now",
      label: "Oct 1–14",
      values: [
        1240, 1380, 1310, 1520, 1690, 2010, 1850, 1420, 1560, 1490, 1710, 1880,
        2240, 2105,
      ],
    },
    {
      key: "before",
      label: "Sep 17–30",
      values: [
        1100, 1190, 1250, 1300, 1480, 1720, 1600, 1350, 1410, 1380, 1550, 1700,
        1960, 1890,
      ],
      comparison: true,
    },
  ],
  formatValue: (value: number) => dollars.format(value),
  formatTick: (value: number) => shortDollars.format(value),
  updated: "Updated 4 min ago",
  href: "#reports-sales",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Overview metrics",
    description:
      "Point at a chart to compare the two periods; a refund rate that falls is good news.",
    render: () => (
      <Grid columns={{ base: 1, md: 3 }} gap={4}>
        <MetricCard {...volume} />
        <MetricCard
          title="New subscribers"
          value="96"
          delta={0.231}
          labels={DAYS}
          series={[
            {
              key: "now",
              label: "Oct 1–14",
              values: [5, 6, 6, 7, 5, 7, 8, 7, 9, 8, 10, 9, 11, 12],
            },
            {
              key: "before",
              label: "Sep 17–30",
              values: [4, 5, 5, 6, 5, 6, 6, 5, 6, 6, 7, 7, 8, 8],
              comparison: true,
            },
          ]}
          updated="Updated 4 min ago"
          href="#reports-subscribers"
        />
        <MetricCard
          title="Refund rate"
          info="Refunds as a share of orders."
          value="0.9%"
          delta={-0.18}
          lowerIsBetter
          labels={DAYS}
          series={[
            {
              key: "now",
              label: "Oct 1–14",
              values: [
                1.2, 1.1, 1, 1, 0.9, 1, 0.9, 0.8, 0.9, 0.8, 0.9, 0.8, 0.8, 0.9,
              ],
            },
            {
              key: "before",
              label: "Sep 17–30",
              values: [
                1.3, 1.2, 1.2, 1.1, 1.1, 1.2, 1, 1.1, 1, 1.1, 1, 1, 1.1, 1,
              ],
              comparison: true,
            },
          ]}
          formatValue={(value) => `${String(value)}%`}
          formatTick={(value) => `${String(value)}%`}
          updated="Updated 4 min ago"
          href="#reports-refunds"
        />
      </Grid>
    ),
  },
  {
    title: "Loading",
    description:
      "Each part is a skeleton in its own place, and the chart shows its pill after 300ms.",
    render: () => <MetricCard {...volume} loading />,
  },
];
