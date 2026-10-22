import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SearchField, TopBar, matchesSearch } from "@buttery/react";
import { Bell, CircleHelp } from "lucide-react";

interface Order {
  readonly id: number;
  readonly customer: string;
  readonly beans: string;
}

const ORDERS: readonly Order[] = [
  { id: 1042, customer: "Corner Café", beans: "Guji, 2 kg" },
  { id: 1043, customer: "Ines Moreau", beans: "Decaf Huila, 250 g" },
  { id: 1044, customer: "Hill Street Bakery", beans: "Cerrado, 5 kg" },
];

/** A dashboard's top bar over its page: the search filters the orders, Help shows a tip and New order adds one. */
export function DashboardTopBar(): ReactElement {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState(ORDERS);
  const [help, setHelp] = useState(false);
  const [unread, setUnread] = useState(true);
  const shown = orders.filter(
    (order) =>
      query.trim() === "" || matchesSearch(query, order.customer, order.beans),
  );
  return (
    <Stack gap={4}>
      <TopBar
        search={
          <SearchField
            variant="soft"
            label="Search orders, customers and beans"
            placeholder="Search"
            shortcut="/"
            value={query}
            onValueChange={setQuery}
          />
        }
        actions={
          <>
            <TopBar.Action
              icon={CircleHelp}
              label="Help"
              aria-expanded={help}
              onSelect={() => {
                setHelp(!help);
              }}
            />
            <TopBar.Action
              icon={Bell}
              label="Notifications"
              dot={unread}
              priority={1}
              onSelect={() => {
                setUnread(false);
              }}
            />
          </>
        }
        create={{
          label: "New order",
          onSelect: () => {
            setOrders([
              ...orders,
              {
                id: 1042 + orders.length,
                customer: "Walk-in customer",
                beans: "Guji, 250 g",
              },
            ]);
          },
        }}
      />
      {help ? (
        <Text variant="body-sm" tone="secondary">
          Press / to search, and the plus to start an order.
        </Text>
      ) : null}
      <Surface level="card" pad={4}>
        <Stack gap={3}>
          {shown.length === 0 ? (
            <Text variant="body" tone="secondary">
              No orders match.
            </Text>
          ) : (
            shown.map((order) => (
              <Inline key={order.id} gap={4} justify="between">
                <Text variant="body">{`Order ${String(order.id)}, ${order.customer}`}</Text>
                <Text variant="body" tone="secondary">
                  {order.beans}
                </Text>
              </Inline>
            ))
          )}
        </Stack>
      </Surface>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "New order");
  await see("Order 1045, Walk-in customer");
  await type("Search orders, customers and beans", "espresso");
  await see("No orders match.");
};
