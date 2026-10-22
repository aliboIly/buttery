import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AppPage, AppShell, PageHeader, Sidebar, TopBar } from "@buttery/react";
import { Bell, House, Receipt, Users } from "lucide-react";

/** A dashboard: the sidebar beside the top bar and the page, the top bar's create button adding an order. */
export function RoasteryDashboard(): ReactElement {
  const [orders, setOrders] = useState<readonly number[]>([1053, 1052]);
  const [unread, setUnread] = useState(true);
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
          </Sidebar>
        }
        topBar={
          <TopBar
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
                setOrders((current) => [(current[0] ?? 1052) + 1, ...current]);
              },
            }}
          />
        }
      >
        <AppPage
          header={<PageHeader title="Orders" value={String(orders.length)} />}
        >
          <AppPage.Section
            title="Today"
            description={
              unread ? "Two customers wrote back." : "All caught up."
            }
          >
            <Stack gap={1}>
              {orders.map((order) => (
                <Text key={order} variant="body">
                  {`Order ${String(order)}`}
                </Text>
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
  await see("Order 1054");
  await press("button", "Notifications, new");
  await see("All caught up.");
};
