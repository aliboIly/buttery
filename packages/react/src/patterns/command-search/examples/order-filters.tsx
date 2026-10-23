import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { CommandSearch, matchesSearch, parseSearch } from "@butteryui/react";
import type { LocalSearchSource, SearchFilter } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

const FILTERS: readonly SearchFilter[] = [
  {
    key: "status",
    example: "shipped",
    description: "where an order has got to",
    values: ["paid", "roasting", "shipped"],
  },
];

const ORDERS = [
  { id: "1042", customer: "Ines Vale", status: "shipped" },
  { id: "1043", customer: "Oskar Lind", status: "roasting" },
  { id: "1044", customer: "Ines Vale", status: "paid" },
];

const ORDER_SOURCE: LocalSearchSource = {
  id: "orders",
  label: "Orders",
  search: (query) =>
    ORDERS.filter(
      (order) =>
        query.filters.every((token) => order.status === token.value) &&
        (query.text.trim() === "" ||
          matchesSearch(query.text, order.id, order.customer)),
    ).map((order) => ({
      id: order.id,
      label: `Order ${order.id}`,
      detail: `${order.customer}, ${order.status}`,
    })),
};

/** Orders narrowed by a status filter typed as key:value, which turns into a chip. */
export function OrderFilters(): ReactElement {
  const [value, setValue] = useState("");
  const query = parseSearch(value, FILTERS);
  const [status] = query.filters;
  return (
    <Stack gap={3}>
      <CommandSearch
        label="Search orders"
        sources={[ORDER_SOURCE]}
        filters={FILTERS}
        value={value}
        onValueChange={setValue}
      />
      <Text variant="caption">
        {status === undefined
          ? "Every order"
          : `Showing ${status.value} orders`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("combobox", "Search orders");
  await type("Search orders", "status:shipped ");
  await see("Showing shipped orders");
};
