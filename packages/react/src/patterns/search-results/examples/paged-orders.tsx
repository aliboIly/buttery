import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SearchResults, matchesSearch } from "@butteryui/react";
import type { LocalSearchSource } from "@butteryui/react";
import { Receipt } from "lucide-react";

const ORDERS = Array.from({ length: 12 }, (_, index) => ({
  id: String(1040 + index),
  number: `Order ${String(1040 + index)}`,
  status: "shipped",
}));

const SHIPPED: LocalSearchSource = {
  id: "orders",
  label: "Orders",
  search: (query) =>
    ORDERS.filter((order) => matchesSearch(query.text, order.status)).map(
      (order) => ({
        id: order.id,
        label: order.number,
        detail: "Shipped this week",
        icon: Receipt,
        href: `#order-${order.id}`,
      }),
    ),
};

/** Every shipped order, five at a time, a button under them showing the next five. */
export function PagedOrders(): ReactElement {
  return (
    <SearchResults
      width="medium"
      query={{ text: "shipped", filters: [] }}
      sources={[SHIPPED]}
      pageSize={5}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("12 results");
  await press("button", "Show 5 more");
  await see("Order 1049");
  await press("button", "Show 2 more");
  await see("Order 1051");
};
