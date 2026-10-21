import { Grid } from "@buttery/core";
import {
  AppPage,
  Banner,
  BarChart,
  Button,
  DateRangeBar,
  MetricCard,
  PageHeader,
  RecommendationCard,
} from "@buttery/react";
import type { ChartSeries, DateRangeValue } from "@buttery/react";
import { Truck } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { NEXT_PAYOUT, bagCount, daily, salesTotal, sum } from "./data.ts";
import type { Order } from "./data.ts";
import { change, money, number, shortDate, shortMoney } from "./format.ts";
import { go } from "./navigation.ts";
import {
  alignedBuckets,
  bucketLabels,
  buckets,
  comparisonDays,
  measured,
  periodDays,
} from "./period.ts";
import { StockList } from "./stock.tsx";

const WEEKDAYS = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];

interface Measured {
  readonly value: number;
  readonly delta: number | undefined;
  readonly series: ChartSeries[];
}

/** One metric over the period: its total, its change on the comparison, and its points to plot. */
function measure(
  count: (orders: readonly Order[]) => number,
  period: DateRangeValue,
): Measured {
  const days = periodDays(period);
  const groups = buckets(days, period.interval);
  const now = measured(count, groups);
  const before = comparisonDays(period, days);
  if (before === undefined)
    return {
      value: sum(now),
      delta: undefined,
      series: [{ key: "now", label: "This period", values: now }],
    };
  const then = measured(count, alignedBuckets(groups, before));
  return {
    value: sum(now),
    delta: change(sum(now), sum(then)),
    series: [
      { key: "now", label: "This period", values: now },
      {
        key: "before",
        label:
          period.comparison === "previous-year"
            ? "A year before"
            : "Period before",
        values: then,
        comparison: true,
      },
    ],
  };
}

/** The roastery's front page: today's numbers, what's roasting and what's on hand. */
export function OverviewPage(): ReactElement {
  const [period, setPeriod] = useState<DateRangeValue>({
    range: "last-7-days",
    interval: "daily",
    comparison: "previous-period",
  });
  const labels = bucketLabels(
    buckets(periodDays(period), period.interval),
    period.interval,
  );
  const sales = measure(salesTotal, period);
  const orders = measure((list) => list.length, period);
  const bags = measure(bagCount, period);
  const refunds = measure(
    (list) => list.filter((order) => order.status === "refunded").length,
    period,
  );
  const thisWeek = daily(bagCount, 7);
  const lastWeek = daily(bagCount, 7, 7);
  const nextPayout = NEXT_PAYOUT;
  return (
    <AppPage
      header={<PageHeader title="Overview" />}
      aside={
        <>
          <AppPage.Section>
            <RecommendationCard
              title="Get an alert when green coffee runs low"
              action={{ label: "Turn on alerts", href: "#/roastery/stock" }}
              estimate="2 min"
              storageKey="roastery-low-stock"
            >
              Nyeri is down to 180 kg, about nine days of roasting.
            </RecommendationCard>
          </AppPage.Section>
          {nextPayout === undefined ? null : (
            <AppPage.Section>
              <MetricCard
                title="Next payout"
                info="This week's paid sales, less fees, sent to your bank on Friday."
                value={money(nextPayout.amount)}
                updated={`Arrives ${shortDate(nextPayout.arrives)}`}
                href="#/roastery/payouts"
                onNavigate={(href, event) => {
                  event.preventDefault();
                  go(href);
                }}
              />
            </AppPage.Section>
          )}
        </>
      }
      asideLabel="Tips and payouts"
    >
      <Banner
        icon={Truck}
        action={{ label: "Turn on pickup", href: "#/roastery/settings" }}
        estimate="2 min"
        storageKey="roastery-pickup"
      >
        Customers within 20 miles can collect their coffee at the roastery.
      </Banner>
      <AppPage.Section title="Your numbers">
        <DateRangeBar value={period} onValueChange={setPeriod} />
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <MetricCard
            title="Sales"
            info="Every sale, before refunds and fees."
            value={money(sales.value)}
            delta={sales.delta}
            labels={labels}
            series={sales.series}
            formatValue={money}
            formatTick={shortMoney}
            updated="Updated just now"
            href="#/roastery/payouts"
          />
          <MetricCard
            title="Orders"
            value={number(orders.value)}
            delta={orders.delta}
            labels={labels}
            series={orders.series}
            updated="Updated just now"
            href="#/roastery/orders"
          />
          <MetricCard
            title="Bags sold"
            info="Bags in every order, retail and wholesale."
            value={number(bags.value)}
            delta={bags.delta}
            labels={labels}
            series={bags.series}
            updated="Updated just now"
            href="#/roastery/stock"
          />
          <MetricCard
            title="Refunds"
            info="Orders refunded in the period. Fewer is better."
            value={number(refunds.value)}
            delta={refunds.delta}
            lowerIsBetter
            labels={labels}
            series={refunds.series}
            updated="Updated just now"
            href="#/roastery/orders"
          />
        </Grid>
      </AppPage.Section>
      <AppPage.Section
        title="Bags this week"
        actions={
          <Button
            size="sm"
            onClick={() => {
              go("#/roastery/orders");
            }}
          >
            See orders
          </Button>
        }
      >
        <BarChart
          label="Bags sold each day this week"
          summary={`${number(sum(thisWeek))} bags this week, against ${number(sum(lastWeek))} last week.`}
          labels={WEEKDAYS}
          labelsHeading="Day"
          series={[
            { key: "now", label: "This week", values: thisWeek },
            {
              key: "before",
              label: "Last week",
              values: lastWeek,
              comparison: true,
            },
          ]}
        />
      </AppPage.Section>
      <AppPage.Section title="Green coffee on hand">
        <StockList href="#/roastery/stock" />
      </AppPage.Section>
    </AppPage>
  );
}
