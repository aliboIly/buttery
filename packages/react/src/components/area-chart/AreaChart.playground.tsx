import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { AreaChart } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "AreaChart",
  description:
    "Values over time as lines with their area filled in faintly, for totals that build up, with a crosshair and tooltip.",
  order: 10,
  status: "new",
  since: "0.8.0",
};

const MONTHS = [
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
];
const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const shortDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

const REVENUE = [
  8200, 8650, 9100, 8900, 9400, 9850, 10300, 10100, 10750, 11200, 11600, 12150,
];

export const live: LiveDemo = {
  controls: {
    size: { kind: "choice", options: ["sm", "md", "lg"], initial: "md" },
    loading: { kind: "toggle", initial: false },
  },
  render: ({ size, loading }) => (
    <AreaChart
      label="Subscription revenue"
      labels={MONTHS}
      labelsHeading="Month"
      series={[{ key: "revenue", label: "Revenue", values: REVENUE }]}
      formatValue={(value) => dollars.format(value)}
      formatTick={(value) => shortDollars.format(value)}
      size={demoChoice(size, ["md", "sm", "lg"])}
      loading={loading === true}
    />
  ),
  code: ({ size, loading }) =>
    [
      "<AreaChart",
      '  label="Subscription revenue"',
      `  labels={${JSON.stringify(MONTHS)}}`,
      '  labelsHeading="Month"',
      `  series={[{ key: "revenue", label: "Revenue", values: ${JSON.stringify(REVENUE)} }]}`,
      "  formatValue={(value) => dollars.format(value)}",
      "  formatTick={(value) => shortDollars.format(value)}",
      `  size="${demoChoice(size, ["md", "sm", "lg"])}"`,
      ...(loading === true ? ["  loading"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "A total that builds up",
    render: () => (
      <AreaChart
        label="Subscription revenue"
        summary="Up 48% over the year."
        labels={MONTHS}
        labelsHeading="Month"
        series={[
          {
            key: "revenue",
            label: "Revenue",
            values: [
              8200, 8650, 9100, 8900, 9400, 9850, 10300, 10100, 10750, 11200,
              11600, 12150,
            ],
          },
        ]}
        formatValue={(value) => dollars.format(value)}
        formatTick={(value) => shortDollars.format(value)}
      />
    ),
  },
  {
    title: "Against last year",
    description: "The comparison is a gray line with no fill.",
    render: () => (
      <AreaChart
        label="Subscription revenue"
        size="sm"
        labels={MONTHS}
        series={[
          {
            key: "now",
            label: "This year",
            values: [
              8200, 8650, 9100, 8900, 9400, 9850, 10300, 10100, 10750, 11200,
              11600, 12150,
            ],
          },
          {
            key: "before",
            label: "Last year",
            values: [
              6100, 6300, 6800, 6700, 7100, 7400, 7900, 7800, 8200, 8500, 8700,
              9000,
            ],
            comparison: true,
          },
        ]}
        formatValue={(value) => dollars.format(value)}
        formatTick={(value) => shortDollars.format(value)}
      />
    ),
  },
];
