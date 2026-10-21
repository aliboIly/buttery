import {
  AppPage,
  AreaChart,
  DataTable,
  PageHeader,
  StatTabs,
  StatusBadge,
  toast,
} from "@buttery/react";
import type { DataTableColumn, StatusTone } from "@buttery/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { customerCell } from "./customer-cell.tsx";
import { SUBSCRIPTIONS, coffeeOf, monthly, salesTotal } from "./data.ts";
import type { Subscription, SubscriptionStatus } from "./data.ts";
import {
  change,
  number,
  percent,
  roundMoney,
  shortDate,
  shortMoney,
} from "./format.ts";

const REVENUE = monthly(
  (orders) =>
    salesTotal(orders.filter((order) => order.channel === "subscription")),
  12,
);
const GROWTH = change(REVENUE.values.at(-1) ?? 0, REVENUE.values[0] ?? 0);

const STATES: Readonly<
  Record<
    SubscriptionStatus,
    { readonly label: string; readonly tone: StatusTone }
  >
> = {
  active: { label: "Active", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

const COLUMNS: readonly DataTableColumn<Subscription>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: (subscription) => customerCell(subscription.customerId),
    minWidth: "md",
    grow: 2,
  },
  {
    id: "coffee",
    header: "Coffee",
    cell: (subscription) => coffeeOf(subscription.coffeeId).name,
    minWidth: "md",
    grow: 2,
  },
  {
    id: "every",
    header: "Every",
    cell: (subscription) => subscription.every,
    minWidth: "sm",
  },
  {
    id: "bags",
    header: "Bags",
    cell: (subscription) => subscription.bags,
    minWidth: "xs",
    align: "end",
  },
  {
    id: "next",
    header: "Next delivery",
    cell: (subscription) =>
      subscription.next === null ? "—" : shortDate(subscription.next),
    minWidth: "sm",
  },
  {
    id: "status",
    header: "Status",
    cell: (subscription) => (
      <StatusBadge tone={STATES[subscription.status].tone}>
        {STATES[subscription.status].label}
      </StatusBadge>
    ),
    minWidth: "sm",
    skeleton: "badge",
  },
];

/** Coffee on a schedule: revenue over the year and every subscription by state. */
export function SubscriptionsPage(): ReactElement {
  const [state, setState] = useState<string>("active");
  const count = (status: SubscriptionStatus): number =>
    SUBSCRIPTIONS.filter((subscription) => subscription.status === status)
      .length;
  return (
    <AppPage
      header={
        <PageHeader
          title="Subscriptions"
          value={number(count("active"))}
          valueInfo="Subscriptions that deliver on schedule, not counting paused ones."
          actions={
            <PageHeader.Action
              label="New plan"
              icon={Plus}
              variant="primary"
              onSelect={() => {
                toast("Plans are set in Settings in this demo.");
              }}
            />
          }
        />
      }
    >
      <AppPage.Section title="Revenue">
        <AreaChart
          label="Subscription revenue by month"
          summary={
            GROWTH === undefined
              ? "Revenue from subscriptions over the last 12 months."
              : `${GROWTH < 0 ? "Down" : "Up"} ${percent(Math.abs(GROWTH))} over the last 12 months.`
          }
          labels={REVENUE.labels}
          labelsHeading="Month"
          series={[
            { key: "revenue", label: "Revenue", values: REVENUE.values },
          ]}
          formatValue={roundMoney}
          formatTick={shortMoney}
        />
      </AppPage.Section>
      <AppPage.Section title="All subscriptions">
        <StatTabs
          label="Subscriptions by state"
          value={state}
          onValueChange={setState}
          tabs={[
            { value: "active", label: "Active", count: count("active") },
            { value: "paused", label: "Paused", count: count("paused") },
            {
              value: "cancelled",
              label: "Cancelled",
              count: count("cancelled"),
            },
          ]}
        />
        <DataTable<Subscription>
          label="Subscriptions"
          size="compact"
          columns={COLUMNS}
          rows={SUBSCRIPTIONS.filter(
            (subscription) => subscription.status === state,
          )}
          rowKey={(subscription) => subscription.id}
        />
      </AppPage.Section>
    </AppPage>
  );
}
