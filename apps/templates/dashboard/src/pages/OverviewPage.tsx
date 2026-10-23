import type { ReactElement } from "react";
import { Grid } from "@butteryui/core";
import {
  AppPage,
  ArrowLink,
  BarChart,
  MetricCard,
  PageHeader,
} from "@butteryui/react";
import { ORDER_COUNTS, SALES, WEEK, change, money, total } from "../data.ts";
import { useLink } from "../router.tsx";

/** The dashboard's front page: the week's numbers, then sales day by day. */
export function OverviewPage(): ReactElement {
  const link = useLink();
  const sales = total(SALES.now);
  const orders = total(ORDER_COUNTS.now);
  return (
    <AppPage
      header={
        <PageHeader
          title="Overview"
          description="How the shop did over the last seven days."
        />
      }
    >
      <AppPage.Section title="This week">
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <MetricCard
            title="Sales"
            info="Every sale, before refunds and fees."
            value={money(sales)}
            delta={change(sales, total(SALES.before))}
            labels={WEEK}
            series={[
              { key: "now", label: "This week", values: SALES.now },
              {
                key: "before",
                label: "Last week",
                values: SALES.before,
                comparison: true,
              },
            ]}
            formatValue={money}
            updated="Updated just now"
            href={link("/orders")}
          />
          <MetricCard
            title="Orders"
            value={String(orders)}
            delta={change(orders, total(ORDER_COUNTS.before))}
            labels={WEEK}
            series={[
              { key: "now", label: "This week", values: ORDER_COUNTS.now },
              {
                key: "before",
                label: "Last week",
                values: ORDER_COUNTS.before,
                comparison: true,
              },
            ]}
            updated="Updated just now"
            href={link("/orders")}
          />
        </Grid>
      </AppPage.Section>
      <AppPage.Section
        title="Sales each day"
        actions={<ArrowLink href={link("/orders")}>See orders</ArrowLink>}
      >
        <BarChart
          label="Sales each day this week"
          summary={`${money(sales)} this week, against ${money(total(SALES.before))} the week before.`}
          labels={WEEK}
          labelsHeading="Day"
          series={[
            { key: "now", label: "This week", values: SALES.now },
            {
              key: "before",
              label: "Last week",
              values: SALES.before,
              comparison: true,
            },
          ]}
          formatValue={money}
        />
      </AppPage.Section>
    </AppPage>
  );
}
