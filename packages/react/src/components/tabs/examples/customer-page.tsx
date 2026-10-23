import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { PageHeader, StatusBadge, Tabs } from "@butteryui/react";

const ORDERS: readonly {
  readonly id: string;
  readonly item: string;
  readonly shipped: boolean;
}[] = [
  { id: "1042", item: "2 bags of house blend", shipped: false },
  { id: "1031", item: "1 bag of decaf", shipped: true },
  { id: "1019", item: "A tasting set", shipped: true },
];

/** A customer's page: the tabs sit in the page header, and each panel holds that part of the record. */
export function CustomerPage(): ReactElement {
  return (
    <Tabs defaultValue="orders">
      <PageHeader
        title="Ines Vale"
        description="A customer since March, with 14 orders."
      >
        <Tabs.List label="Customer">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="orders">Orders</Tabs.Tab>
          <Tabs.Tab value="subscriptions">Subscriptions</Tabs.Tab>
        </Tabs.List>
      </PageHeader>
      <Tabs.Panel value="overview">
        <Text variant="body">
          Prefers a lighter roast, ground for a filter.
        </Text>
      </Tabs.Panel>
      <Tabs.Panel value="orders">
        <Stack gap={3}>
          {ORDERS.map((order) => (
            <Inline key={order.id} gap={3} justify="between">
              <Text truncate>{`Order ${order.id} · ${order.item}`}</Text>
              <StatusBadge tone={order.shipped ? "success" : "info"}>
                {order.shipped ? "Shipped" : "Roasting"}
              </StatusBadge>
            </Inline>
          ))}
        </Stack>
      </Tabs.Panel>
      <Tabs.Panel value="subscriptions">
        <Text variant="body">
          One bag of the house blend every two weeks, next on Friday.
        </Text>
      </Tabs.Panel>
    </Tabs>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Order 1042 · 2 bags of house blend");
  await press("tab", "Subscriptions");
  await see("One bag of the house blend every two weeks, next on Friday.");
};
