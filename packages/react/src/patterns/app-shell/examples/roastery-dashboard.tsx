import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  AppPage,
  AppShell,
  PageHeader,
  SearchField,
  SegmentedControl,
  Sidebar,
  StatusBadge,
  TopBar,
} from "@buttery/react";
import type { StatusTone } from "@buttery/react";
import { Bell, House, Package, Receipt, Repeat, Users } from "lucide-react";

interface Order {
  readonly id: number;
  readonly customer: string;
  readonly status: "Paid" | "Roasting" | "Shipped";
}

type Shown = "all" | "open" | "shipped";

const TONES: Readonly<Record<Order["status"], StatusTone>> = {
  Paid: "info",
  Roasting: "warning",
  Shipped: "success",
};

const WEEK = [
  { label: "Orders", value: "48" },
  { label: "Bags roasted", value: "212" },
  { label: "Sales", value: "$3,940" },
] as const;

const TODAY: readonly Order[] = [
  { id: 1053, customer: "Blue Door Café", status: "Paid" },
  { id: 1052, customer: "Ines Vale", status: "Roasting" },
  { id: 1051, customer: "Pier 9 Kiosk", status: "Shipped" },
];

/**
 * A dashboard: the sidebar beside the top bar and the page, the week's numbers and today's orders, which a
 * control filters, beside a rail of what needs attention, and the top bar's create button adding an order.
 */
export function RoasteryDashboard(): ReactElement {
  const [orders, setOrders] = useState<readonly Order[]>(TODAY);
  const [shown, setShown] = useState<Shown>("all");
  const [unread, setUnread] = useState(true);
  const listed = orders.filter(({ status }) => {
    if (shown === "all") return true;
    return shown === "shipped" ? status === "Shipped" : status !== "Shipped";
  });
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}>
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar label="Main">
            <Sidebar.Item label="Home" href="#home" icon={House} />
            <Sidebar.Item
              label="Orders"
              href="#orders"
              icon={Receipt}
              current
            />
            <Sidebar.Item label="Customers" href="#customers" icon={Users} />
            <Sidebar.Item
              label="Subscriptions"
              href="#subscriptions"
              icon={Repeat}
            />
            <Sidebar.Item label="Stock" href="#stock" icon={Package} />
          </Sidebar>
        }
        topBar={
          <TopBar
            search={
              <SearchField
                variant="soft"
                label="Search orders and customers"
                placeholder="Search"
                shortcut="/"
              />
            }
            actions={
              <TopBar.Action
                icon={Bell}
                label="Notifications"
                dot={unread}
                onSelect={() => {
                  setUnread(false);
                }}
              />
            }
            create={{
              label: "New order",
              onSelect: () => {
                setOrders((current) => [
                  {
                    id: (current[0]?.id ?? 1053) + 1,
                    customer: "Corner Café",
                    status: "Paid",
                  },
                  ...current,
                ]);
              },
            }}
          />
        }
      >
        <AppPage
          header={
            <PageHeader
              title="Orders"
              value={String(orders.length)}
              description="The week so far, and what came in today."
            />
          }
          asideLabel="Needs attention"
          aside={
            <Surface level="card" pad={4}>
              <Stack gap={1}>
                <Text variant="label">
                  {unread ? "Two customers wrote back" : "All caught up."}
                </Text>
                <Text variant="body-sm" tone="secondary">
                  {unread
                    ? "Both ask when Friday's wholesale bags ship."
                    : "Nothing needs an answer."}
                </Text>
              </Stack>
            </Surface>
          }
        >
          <AppPage.Section title="This week">
            <Grid columns={{ base: 1, md: 3 }} gap={4}>
              {WEEK.map(({ label, value }) => (
                <Surface key={label} level="card" pad={4}>
                  <Stack gap={2}>
                    <Text variant="caption" tone="secondary">
                      {label}
                    </Text>
                    <Text variant="title" tabular>
                      {value}
                    </Text>
                  </Stack>
                </Surface>
              ))}
            </Grid>
          </AppPage.Section>
          <AppPage.Section
            title="Today"
            actions={
              <SegmentedControl<Shown>
                label="Show orders"
                options={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "shipped", label: "Shipped" },
                ]}
                value={shown}
                onValueChange={setShown}
              />
            }
          >
            <Stack gap={2}>
              {listed.map((order) => (
                <Inline key={order.id} gap={3} align="center" justify="between">
                  <Text variant="body">
                    {`Order ${String(order.id)} · ${order.customer}`}
                  </Text>
                  <StatusBadge tone={TONES[order.status]}>
                    {order.status}
                  </StatusBadge>
                </Inline>
              ))}
            </Stack>
          </AppPage.Section>
        </AppPage>
      </AppShell>
    </div>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New order");
  await see("Order 1054 · Corner Café");
  await press("radio", "Shipped");
  await see("Order 1051 · Pier 9 Kiosk");
  await press("button", "Notifications, new");
  await see("All caught up.");
};
