import { Grid, demoChoice } from "@butteryui/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { MetricCard } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "MetricCard",
  description:
    "One metric on a card: its title, value and change against the previous period, a small chart of both periods, and when it was updated.",
  order: 120,
  status: "new",
  since: "0.8.0",
};

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

const VARIANTS = ["elevated", "outline", "soft", "plain", "tinted"] as const;
const SIZES = ["md", "lg"] as const;

function metricCode({
  value,
  delta,
  lowerIsBetter,
  loading,
  variant,
  size,
}: DemoValues): string {
  return [
    "<MetricCard",
    '  title="Sales"',
    '  info="Every sale, before refunds and fees."',
    `  value="${String(value)}"`,
    `  delta={${String(delta)}}`,
    ...(lowerIsBetter === true ? ["  lowerIsBetter"] : []),
    "  labels={days}",
    "  series={[thisPeriod, { ...lastPeriod, comparison: true }]}",
    '  updated="Updated 4 min ago"',
    '  href="/reports/sales"',
    ...(variant === "elevated" ? [] : [`  variant="${String(variant)}"`]),
    ...(size === "lg" ? ['  size="lg"'] : []),
    ...(loading === true ? ["  loading"] : []),
    "/>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    value: { kind: "text", initial: "$23,405.00" },
    delta: { kind: "number", initial: 0.09, min: -0.3, max: 0.3, step: 0.01 },
    lowerIsBetter: { kind: "toggle", initial: false },
    loading: { kind: "toggle", initial: false },
    variant: { kind: "choice", options: VARIANTS, initial: "elevated" },
    size: { kind: "choice", options: SIZES, initial: "md" },
  },
  render: ({ value, delta, lowerIsBetter, loading, variant, size }) => (
    <MetricCard
      {...volume}
      value={String(value)}
      delta={typeof delta === "number" ? delta : volume.delta}
      lowerIsBetter={lowerIsBetter === true}
      loading={loading === true}
      variant={demoChoice(variant, VARIANTS)}
      size={demoChoice(size, SIZES)}
    />
  ),
  code: metricCode,
};

const subscribers = {
  title: "New subscribers",
  value: "96",
  delta: 0.231,
  labels: DAYS,
  series: [
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
  ],
  updated: "Updated 4 min ago",
  href: "#reports-subscribers",
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
  {
    title: "Variants",
    description:
      "Beside elevated above: outline, a 1px edge drawn inside; soft, the bg-control fill; tinted, bg-tint from the palettes.",
    render: () => (
      <Grid columns={{ base: 1, md: 3 }} gap={4}>
        <MetricCard {...volume} variant="outline" />
        <MetricCard {...subscribers} variant="soft" />
        <MetricCard {...volume} title="Wholesale sales" variant="tinted" />
      </Grid>
    ),
  },
  {
    title: "Plain",
    description:
      "No surface or padding, for metrics in a row on a page or a panel that's already a surface.",
    render: () => (
      <Grid columns={{ base: 1, md: 2 }} gap={8}>
        <MetricCard {...volume} variant="plain" />
        <MetricCard {...subscribers} title="New cafés" variant="plain" />
      </Grid>
    ),
  },
  {
    title: "Sizes",
    description:
      "md sets the value in title-lg; lg sets it at 32px for the one number a page leads with.",
    render: () => (
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <MetricCard {...volume} />
        <MetricCard {...volume} size="lg" />
      </Grid>
    ),
  },
];
