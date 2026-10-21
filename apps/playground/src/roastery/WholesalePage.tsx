import { Grid, Stack, Surface, Text } from "@buttery/core";
import {
  AppPage,
  ArrowLink,
  DataTable,
  FeatureIntro,
  PageHeader,
  Sparkline,
  TabNav,
  ViewToggle,
  toast,
} from "@buttery/react";
import type { DataTableColumn, ViewMode } from "@buttery/react";
import { FileText, Package, Store } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  CUSTOMERS,
  TODAY,
  dayNumber,
  ordersOf,
  salesTotal,
  sum,
} from "./data.ts";
import type { Customer } from "./data.ts";
import { money, number } from "./format.ts";
import { PageFooter } from "./page-footer.tsx";

function CafeCases(): ReactElement {
  const cases = [0, 1, 2];
  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      aria-label="Three cases of coffee, each labelled for a café"
    >
      <rect width="480" height="300" rx="16" fill="var(--bt-bg-section)" />
      {cases.map((index) => (
        <g
          key={index}
          transform={`translate(${String(56 + index * 128)} ${String(96 - index * 12)})`}
        >
          <rect width="112" height="128" rx="12" fill="var(--bt-bg-surface)" />
          <rect
            x="16"
            y="20"
            width="56"
            height="10"
            rx="5"
            fill="var(--bt-text-strong)"
          />
          <rect
            x="16"
            y="40"
            width="80"
            height="8"
            rx="4"
            fill="var(--bt-skeleton-strong)"
          />
          <rect
            x="16"
            y="92"
            width="40"
            height="16"
            rx="8"
            fill="var(--bt-accent-subtle)"
          />
        </g>
      ))}
    </svg>
  );
}

const WEEKS = 12;

/** A café's account: its orders over the last twelve weeks, and the cases it took each week. */
interface Account {
  readonly customer: Customer;
  readonly orders: number;
  readonly spent: number;
  readonly weekly: number[];
}

const ACCOUNTS: readonly Account[] = CUSTOMERS.filter(
  (customer) => customer.kind === "wholesale",
)
  .map((customer): Account => {
    const today = dayNumber(TODAY);
    const recent = ordersOf(customer.id).filter(
      (order) => today - dayNumber(order.placed) < WEEKS * 7,
    );
    const weekly = Array.from({ length: WEEKS }, (_, week) =>
      sum(
        recent
          .filter(
            (order) =>
              Math.floor((today - dayNumber(order.placed)) / 7) ===
              WEEKS - 1 - week,
          )
          .map((order) => order.bags),
      ),
    );
    return {
      customer,
      orders: recent.length,
      spent: salesTotal(recent),
      weekly,
    };
  })
  .sort((a, b) => b.spent - a.spent);

const COLUMNS: readonly DataTableColumn<Account>[] = [
  {
    id: "cafe",
    header: "Café",
    cell: (account) => (
      <DataTable.Link href={`#/roastery/customers/${account.customer.id}`}>
        {account.customer.name}
      </DataTable.Link>
    ),
    minWidth: "lg",
    grow: 2,
  },
  {
    id: "city",
    header: "City",
    cell: (account) => account.customer.city,
    minWidth: "sm",
  },
  {
    id: "orders",
    header: "Orders",
    cell: (account) => number(account.orders),
    minWidth: "sm",
    align: "end",
  },
  {
    id: "spent",
    header: "Spent",
    cell: (account) => (
      <DataTable.Amount value={account.spent} currency="USD" />
    ),
    minWidth: "md",
    align: "end",
  },
  {
    id: "trend",
    header: "Bags a week",
    cell: (account) => (
      <Sparkline
        label={`${account.customer.name}, bags a week over 12 weeks`}
        values={account.weekly}
      />
    ),
    minWidth: "md",
  },
];

function AccountCard({ account }: { readonly account: Account }): ReactElement {
  return (
    <Surface pad={4}>
      <Stack gap={3}>
        <Stack gap={1}>
          <Text variant="title-sm" asChild>
            <h3>
              <ArrowLink href={`#/roastery/customers/${account.customer.id}`}>
                {account.customer.name}
              </ArrowLink>
            </h3>
          </Text>
          <Text variant="caption" tone="secondary">
            {`${account.customer.city} · ${number(account.orders)} orders in 12 weeks`}
          </Text>
        </Stack>
        <Sparkline
          label={`${account.customer.name}, bags a week over 12 weeks`}
          values={account.weekly}
        />
        <Text variant="body-sm" tabular>
          {money(account.spent)}
        </Text>
      </Stack>
    </Surface>
  );
}

function Accounts(): ReactElement {
  const [view, setView] = useState<ViewMode>("grid");
  return (
    <AppPage.Section
      title="Accounts"
      actions={<ViewToggle value={view} onValueChange={setView} />}
    >
      {view === "grid" ? (
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {ACCOUNTS.map((account) => (
            <AccountCard key={account.customer.id} account={account} />
          ))}
        </Grid>
      ) : (
        <DataTable<Account>
          label="Wholesale accounts"
          columns={COLUMNS}
          rows={ACCOUNTS}
          rowKey={(account) => account.customer.id}
        />
      )}
    </AppPage.Section>
  );
}

function PriceLists(): ReactElement {
  return (
    <AppPage.Section>
      <FeatureIntro
        title="Give each café its own prices"
        description="A price list sets what a café pays per case, by coffee, and its terms."
        benefits={[
          { icon: Store, text: "Prices per café or per group of cafés" },
          { icon: FileText, text: "Invoices use the café's prices" },
          { icon: Package, text: "Cases roast with your retail orders" },
        ]}
        action={{
          label: "Create a price list",
          onClick: () => {
            toast.success("Started a price list for your cafés.");
          },
        }}
        media={<CafeCases />}
      />
    </AppPage.Section>
  );
}

/** The cafés that buy by the case, and the price lists to come. */
export function WholesalePage({
  tab,
}: {
  readonly tab: "accounts" | "prices";
}): ReactElement {
  return (
    <AppPage
      footer={<PageFooter />}
      key={tab}
      header={
        <PageHeader
          title="Wholesale"
          description="Cafés that buy from the roastery, and the prices they pay."
          value={number(ACCOUNTS.length)}
          valueInfo="Cafés with a wholesale account."
        >
          <TabNav label="Wholesale">
            <TabNav.Link
              href="#/roastery/wholesale"
              current={tab === "accounts"}
            >
              Accounts
            </TabNav.Link>
            <TabNav.Link
              href="#/roastery/wholesale/prices"
              current={tab === "prices"}
            >
              Price lists
            </TabNav.Link>
          </TabNav>
        </PageHeader>
      }
    >
      {tab === "accounts" ? <Accounts /> : <PriceLists />}
    </AppPage>
  );
}
