import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  AppPage,
  AppShell,
  PageHeader,
  SegmentedControl,
  Sidebar,
  TopBar,
} from "@buttery/react";
import { Receipt, Users } from "lucide-react";

type Filter = "open" | "shipped";

const ORDERS: Readonly<Record<Filter, readonly string[]>> = {
  open: ["Order 1051, roasting", "Order 1053, paid"],
  shipped: ["Order 1038, shipped May 2", "Order 1029, shipped April 18"],
};

/** A customer's page in a dashboard shell: sections with an action, a right rail of facts and a small footer. */
export function CustomerPage(): ReactElement {
  const [filter, setFilter] = useState<Filter>("open");
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}>
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar label="Main">
            <Sidebar.Item label="Orders" href="#orders" icon={Receipt} />
            <Sidebar.Item
              label="Customers"
              href="#customers"
              icon={Users}
              current
            />
          </Sidebar>
        }
        topBar={<TopBar />}
      >
        <AppPage
          header={<PageHeader title="Ines Vale" value="14 orders" />}
          asideLabel="Customer details"
          aside={
            <Surface level="card" pad={4}>
              <Stack gap={1}>
                <Text variant="label">Customer since March</Text>
                <Text variant="body-sm">Prefers a lighter roast.</Text>
              </Stack>
            </Surface>
          }
          footer="Send feedback about this page"
        >
          <AppPage.Section
            title="Orders"
            actions={
              <SegmentedControl<Filter>
                label="Show orders"
                options={[
                  { value: "open", label: "Open" },
                  { value: "shipped", label: "Shipped" },
                ]}
                value={filter}
                onValueChange={setFilter}
              />
            }
          >
            <Stack gap={3}>
              {ORDERS[filter].map((order) => (
                <Text key={order} variant="body">
                  {order}
                </Text>
              ))}
            </Stack>
          </AppPage.Section>
          <AppPage.Section title="Subscription">
            <Text variant="body">
              A bag of the house blend every two weeks.
            </Text>
          </AppPage.Section>
        </AppPage>
      </AppShell>
    </div>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Shipped");
  await see("Order 1038, shipped May 2");
};
