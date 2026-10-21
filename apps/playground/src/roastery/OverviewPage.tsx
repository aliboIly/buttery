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
import {
  PAYOUTS,
  bagCount,
  daily,
  dayLabels,
  salesTotal,
  sum,
} from "./data.ts";
import type { Order } from "./data.ts";
import { change, money, number, shortDate, shortMoney } from "./format.ts";
import { go } from "./navigation.ts";
import { StockList } from "./stock.tsx";

const WEEKDAYS = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];

function daysIn(period: DateRangeValue): number {
  switch (period.range) {
    case "today":
      return 1;
    case "last-7-days":
      return 7;
    case "month-to-date":
      return 21;
    case "last-4-weeks":
    case "last-3-months":
    case "last-12-months":
    case "year-to-date":
    case "custom":
      return 28;
  }
}

/** How many days each point covers: one, or a week for a weekly or monthly interval. */
function spanOf(period: DateRangeValue, days: number): number {
  return period.interval === "daily" || days < 14 ? 1 : 7;
}

/** Combines `values` into points of `span` days, counting back from the most recent. */
function grouped<Value>(
  values: readonly Value[],
  span: number,
  combine: (part: readonly Value[]) => Value,
): Value[] {
  if (span === 1) return [...values];
  const points: Value[] = [];
  for (let end = values.length; end > 0; end -= span)
    points.unshift(combine(values.slice(Math.max(0, end - span), end)));
  return points;
}

function comparison(
  measure: (orders: readonly Order[]) => number,
  days: number,
  period: DateRangeValue,
  label: string,
): ChartSeries[] {
  const span = spanOf(period, days);
  const now: ChartSeries = {
    key: "now",
    label,
    values: grouped(daily(measure, days), span, sum),
  };
  if (period.comparison !== "previous-period") return [now];
  return [
    now,
    {
      key: "before",
      label: "Period before",
      values: grouped(daily(measure, days, days), span, sum),
      comparison: true,
    },
  ];
}

/** The roastery's front page: today's numbers, what's roasting and what's on hand. */
export function OverviewPage(): ReactElement {
  const [period, setPeriod] = useState<DateRangeValue>({
    range: "last-7-days",
    interval: "daily",
    comparison: "previous-period",
  });
  const days = daysIn(period);
  const labels = grouped(
    dayLabels(days),
    spanOf(period, days),
    (part) => part[0] ?? "",
  );
  const metric = (
    measure: (orders: readonly Order[]) => number,
  ): readonly [number, number | undefined] => {
    const now = sum(daily(measure, days));
    const before = sum(daily(measure, days, days));
    return [
      now,
      period.comparison === "previous-period" ? change(now, before) : undefined,
    ];
  };
  const [volume, volumeChange] = metric(salesTotal);
  const [orders, ordersChange] = metric((list) => list.length);
  const [bags, bagsChange] = metric(bagCount);
  const refunded = (list: readonly Order[]): number =>
    list.filter((order) => order.status === "refunded").length;
  const [refunds, refundsChange] = metric(refunded);
  const thisWeek = daily(bagCount, 7);
  const lastWeek = daily(bagCount, 7, 7);
  const nextPayout = PAYOUTS[0];
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
            value={money(volume)}
            delta={volumeChange}
            labels={labels}
            series={comparison(salesTotal, days, period, "This period")}
            formatValue={money}
            formatTick={shortMoney}
            updated="Updated just now"
            href="#/roastery/payouts"
          />
          <MetricCard
            title="Orders"
            value={number(orders)}
            delta={ordersChange}
            labels={labels}
            series={comparison(
              (list) => list.length,
              days,
              period,
              "This period",
            )}
            updated="Updated just now"
            href="#/roastery/orders"
          />
          <MetricCard
            title="Bags sold"
            info="Bags in every order, retail and wholesale."
            value={number(bags)}
            delta={bagsChange}
            labels={labels}
            series={comparison(bagCount, days, period, "This period")}
            updated="Updated just now"
            href="#/roastery/stock"
          />
          <MetricCard
            title="Refunds"
            info="Orders refunded in the period. Fewer is better."
            value={number(refunds)}
            delta={refundsChange}
            lowerIsBetter
            labels={labels}
            series={comparison(refunded, days, period, "This period")}
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
