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
import { useSimulatedLoad } from "./loading.ts";
import {
  alignedBuckets,
  bucketLabels,
  buckets,
  comparisonDays,
  measured,
  periodDays,
} from "./period.ts";
import { usePickup } from "./shop-state.ts";
import { StockList } from "./stock.tsx";
import { STORAGE_PREFIX } from "./storage.ts";
import { PageFooter } from "./page-footer.tsx";
import { useLink, useNavigate } from "./router.tsx";

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
  const total = sum(measured(count, [days]));
  const before = comparisonDays(period, days);
  if (before === undefined)
    return {
      value: total,
      delta: undefined,
      series: [{ key: "now", label: "This period", values: now }],
    };
  const then = measured(count, alignedBuckets(groups, before));
  return {
    value: total,
    delta: change(total, sum(measured(count, [before]))),
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
  const link = useLink();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<DateRangeValue>({
    range: "last-7-days",
    interval: "daily",
    comparison: "previous-period",
  });
  const [pickup] = usePickup();
  const loading = useSimulatedLoad(JSON.stringify(period), 900);
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
      footer={<PageFooter />}
      header={
        <PageHeader
          title="Overview"
          description="How the roastery is doing, and what needs you today."
        />
      }
      aside={
        <>
          <AppPage.Section>
            <RecommendationCard
              title="Get an alert when green coffee runs low"
              action={{
                label: "Turn on alerts",
                href: link("/settings/notifications"),
              }}
              estimate="2 min"
              storageKey={`${STORAGE_PREFIX}-low-stock`}
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
                href={link("/payouts")}
              />
            </AppPage.Section>
          )}
        </>
      }
      asideLabel="Tips and payouts"
    >
      {pickup ? null : (
        <Banner
          icon={Truck}
          action={{
            label: "Turn on pickup",
            href: link("/settings/pickup"),
          }}
          estimate="2 min"
          storageKey={`${STORAGE_PREFIX}-pickup`}
        >
          Customers within 20 miles can collect their coffee at the roastery.
        </Banner>
      )}
      <AppPage.Section title="Your numbers">
        <DateRangeBar value={period} onValueChange={setPeriod} />
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <MetricCard
            title="Sales"
            info="Every sale, after refunds and before fees."
            value={loading ? undefined : money(sales.value)}
            delta={loading ? undefined : sales.delta}
            labels={labels}
            series={sales.series}
            formatValue={money}
            formatTick={shortMoney}
            updated="Updated just now"
            loading={loading}
            href={link("/payouts")}
          />
          <MetricCard
            title="Orders"
            value={loading ? undefined : number(orders.value)}
            delta={loading ? undefined : orders.delta}
            labels={labels}
            series={orders.series}
            updated="Updated just now"
            loading={loading}
            href={link("/orders")}
          />
          <MetricCard
            title="Bags sold"
            info="Bags in every order, retail and wholesale."
            value={loading ? undefined : number(bags.value)}
            delta={loading ? undefined : bags.delta}
            labels={labels}
            series={bags.series}
            updated="Updated just now"
            loading={loading}
            href={link("/stock")}
          />
          <MetricCard
            title="Refunds"
            info="Orders refunded in the period. Fewer is better."
            value={loading ? undefined : number(refunds.value)}
            delta={loading ? undefined : refunds.delta}
            lowerIsBetter
            labels={labels}
            series={refunds.series}
            updated="Updated just now"
            loading={loading}
            href={link("/orders")}
          />
        </Grid>
      </AppPage.Section>
      <AppPage.Section
        title="Bags this week"
        actions={
          <Button
            size="sm"
            onClick={() => {
              navigate("/orders");
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
        <StockList href={link("/stock")} />
      </AppPage.Section>
    </AppPage>
  );
}
