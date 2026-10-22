import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, MetricCard } from "@buttery/react";

const DAYS = [
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** An overview's headline numbers for the week, side by side from the md breakpoint, refreshed together. */
export function OverviewMetrics(): ReactElement {
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState("Updated 4 min ago");

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setUpdated("Updated just now");
    }, 800);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);

  return (
    <Stack gap={4}>
      <Inline gap={3} align="center" justify="between">
        <Text variant="title">This week</Text>
        <Button
          size="sm"
          iconStart={RefreshCw}
          aria-disabled={loading}
          onClick={() => {
            setLoading(true);
          }}
        >
          Refresh
        </Button>
      </Inline>
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <MetricCard
          title="Sales"
          info="Every sale, before refunds and fees."
          value="$12,405.00"
          delta={0.124}
          labels={DAYS}
          series={[
            {
              key: "now",
              label: "This week",
              values: [1420, 1560, 1490, 1710, 1880, 2240, 2105],
            },
            {
              key: "before",
              label: "Last week",
              values: [1350, 1410, 1380, 1550, 1700, 1960, 1890],
              comparison: true,
            },
          ]}
          formatValue={(value) => dollars.format(value)}
          updated={updated}
          href="#reports-sales"
          loading={loading}
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
              label: "This week",
              values: [1.1, 1, 0.9, 1, 0.8, 0.9, 0.9],
            },
            {
              key: "before",
              label: "Last week",
              values: [1.2, 1.1, 1.2, 1, 1.1, 1, 1.1],
              comparison: true,
            },
          ]}
          formatValue={(value) => `${String(value)}%`}
          formatTick={(value) => `${String(value)}%`}
          updated={updated}
          href="#reports-refunds"
          loading={loading}
        />
      </Grid>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Refresh");
  await see("Updated just now");
};
