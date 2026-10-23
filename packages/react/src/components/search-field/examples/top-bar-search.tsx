import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SearchField } from "@butteryui/react";

const ORDERS = [
  { id: "1042", customer: "Blue Door Café", coffee: "Ethiopia Guji" },
  { id: "1043", customer: "Pier 9 Kiosk", coffee: "Colombia Huila" },
  { id: "1044", customer: "Corner Café", coffee: "Ethiopia Guji" },
];

/** A top bar's search, soft and focused from anywhere with /, with the orders it finds listed under the bar. */
export function TopBarSearch(): ReactElement {
  const [query, setQuery] = useState("");
  const words = query.trim().toLowerCase();
  const found = ORDERS.filter((order) =>
    `${order.id} ${order.customer} ${order.coffee}`
      .toLowerCase()
      .includes(words),
  );
  return (
    <Stack gap={4}>
      <Inline gap={4} align="center">
        <Text variant="title-sm">Orders</Text>
        <SearchField
          variant="soft"
          label="Search orders, customers and beans"
          placeholder="Search"
          shortcut="/"
          value={query}
          onValueChange={setQuery}
        />
      </Inline>
      <Text variant="caption" tone="secondary">
        {words === ""
          ? `${String(ORDERS.length)} open orders`
          : `${String(found.length)} of ${String(ORDERS.length)} orders match`}
      </Text>
      <Stack gap={3}>
        {found.map((order) => (
          <Inline key={order.id} gap={3} align="center" justify="between">
            <Text variant="label">{`${order.id} · ${order.customer}`}</Text>
            <Text variant="caption" tone="secondary">
              {order.coffee}
            </Text>
          </Inline>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ key, see }) => {
  await see("3 open orders");
  await key("Slash");
  await key("k");
  await see("1 of 3 orders match");
};
