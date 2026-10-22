import type { DemoSection, DocsPage } from "@buttery/core";
import { LineChart } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "LineChart",
  description:
    "Values over time as smooth lines, the comparison in gray beneath, with a crosshair and tooltip that follow the pointer.",
  order: 110,
  status: "new",
  since: "0.7.0",
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

export const demos: readonly DemoSection[] = [
  {
    title: "This period against the last",
    description:
      "The previous period is gray and beneath; the tooltip shows the change at each point.",
    render: () => (
      <LineChart
        label="Sales"
        summary="Up 9% on the previous two weeks."
        labels={DAYS}
        series={[
          {
            key: "now",
            label: "Oct 1–14",
            values: [
              1240, 1380, 1310, 1520, 1690, 2010, 1850, 1420, 1560, 1490, 1710,
              1880, 2240, 2105,
            ],
          },
          {
            key: "before",
            label: "Sep 17–30",
            values: [
              1100, 1190, 1250, 1300, 1480, 1720, 1600, 1350, 1410, 1380, 1550,
              1700, 1960, 1890,
            ],
            comparison: true,
          },
        ]}
        formatValue={(value) => dollars.format(value)}
        formatTick={(value) => shortDollars.format(value)}
      />
    ),
  },
  {
    title: "Three series, large",
    description:
      "At lg, three more labels show along the bottom once the chart is 640px wide.",
    render: () => (
      <LineChart
        label="Orders by origin"
        size="lg"
        labels={DAYS}
        series={[
          {
            key: "ethiopia",
            label: "Ethiopia",
            values: [18, 21, 19, 24, 27, 31, 29, 22, 25, 23, 28, 30, 35, 33],
          },
          {
            key: "colombia",
            label: "Colombia",
            values: [14, 15, 17, 16, 19, 22, 20, 16, 18, 17, 19, 21, 24, 23],
          },
          {
            key: "brazil",
            label: "Brazil",
            values: [10, 9, 12, 11, 13, 15, 14, 12, 12, null, null, 16, 18, 17],
          },
        ]}
      />
    ),
  },
];
