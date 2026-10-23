import {
  AppPage,
  BarChart,
  DataTable,
  GroupedList,
  InitialsTile,
  PageHeader,
  QuickActions,
  StatusBadge,
  toast,
} from "@butteryui/react";
import type { DataTableColumn, StatusTone } from "@butteryui/react";
import { CalendarClock, Download, Send } from "lucide-react";
import type { ReactElement } from "react";
import { AWAITING_PAYOUT, NEXT_PAYOUT, PAYOUTS, salesTotal } from "./data.ts";
import type { Payout } from "./data.ts";
import { money, shortDate, shortMoney } from "./format.ts";
import { PageFooter } from "./page-footer.tsx";

const STATES: Readonly<
  Record<
    Payout["status"],
    { readonly label: string; readonly tone: StatusTone }
  >
> = {
  paid: { label: "Paid", tone: "success" },
  "in transit": { label: "In transit", tone: "info" },
  scheduled: { label: "Scheduled", tone: "neutral" },
};

const COLUMNS: readonly DataTableColumn<Payout>[] = [
  {
    id: "arrives",
    header: "Arrives",
    cell: (payout) => shortDate(payout.arrives),
    minWidth: "sm",
    grow: 2,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (payout) => <DataTable.Amount value={payout.amount} currency="USD" />,
    minWidth: "md",
    align: "end",
  },
  {
    id: "status",
    header: "Status",
    cell: (payout) => (
      <StatusBadge tone={STATES[payout.status].tone}>
        {STATES[payout.status].label}
      </StatusBadge>
    ),
    minWidth: "sm",
    skeleton: "badge",
  },
];

/** What's on its way to the bank, and what has arrived. */
export function PayoutsPage(): ReactElement {
  const incoming = salesTotal(AWAITING_PAYOUT);
  const next = NEXT_PAYOUT;
  const weeks = PAYOUTS.filter((payout) => payout.status !== "scheduled")
    .slice()
    .reverse();
  return (
    <AppPage
      footer={<PageFooter />}
      header={
        <PageHeader
          title="Payouts"
          description="Sales on their way to the bank, and the ones already there."
          value={money(incoming)}
          valueInfo="Paid orders that aren't in a payout yet."
        >
          <QuickActions label="Payout actions">
            <QuickActions.Action
              label="Pay out now"
              icon={Send}
              priority={2}
              onSelect={() => {
                toast.success(`${money(incoming)} is on its way to your bank.`);
              }}
            />
            <QuickActions.Action
              label="Download statement"
              icon={Download}
              priority={1}
              onSelect={() => {
                toast("Downloaded the October statement.");
              }}
            />
            <QuickActions.Action
              label="Change schedule"
              icon={CalendarClock}
              onSelect={() => {
                toast("Payouts stay on Fridays in this demo.");
              }}
            />
          </QuickActions>
        </PageHeader>
      }
    >
      <AppPage.Section title="Balances">
        <GroupedList>
          <GroupedList.Group>
            <GroupedList.Item
              title="Incoming"
              description="Paid orders that aren't in a payout yet"
              media={<InitialsTile name="Incoming" size="md" />}
              value={money(incoming)}
            />
          </GroupedList.Group>
          <GroupedList.Group title="Bank account">
            <GroupedList.Item
              title="Cascade Credit Union •• 4410"
              description={
                next === undefined
                  ? undefined
                  : `Next payout ${shortDate(next.arrives)}`
              }
              media={<InitialsTile name="Cascade Credit" size="md" />}
              value={next === undefined ? undefined : money(next.amount)}
            />
          </GroupedList.Group>
          <GroupedList.Add
            label="Add a bank account"
            onClick={() => {
              toast("One bank account is all this demo needs.");
            }}
          />
        </GroupedList>
      </AppPage.Section>
      <AppPage.Section title="By week">
        <BarChart
          label="Payouts by week"
          labels={weeks.map((payout) => shortDate(payout.arrives))}
          labelsHeading="Arrives"
          series={[
            {
              key: "payouts",
              label: "Payout",
              values: weeks.map((payout) => payout.amount),
            },
          ]}
          formatValue={money}
          formatTick={shortMoney}
          size="sm"
        />
      </AppPage.Section>
      <AppPage.Section title="Recent payouts">
        <DataTable<Payout>
          label="Recent payouts"
          size="compact"
          columns={COLUMNS}
          rows={PAYOUTS}
          rowKey={(payout) => payout.id}
        />
      </AppPage.Section>
    </AppPage>
  );
}
