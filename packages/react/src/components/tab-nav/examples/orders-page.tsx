import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { PageHeader, TabNav } from "@butteryui/react";

type View = "all" | "open" | "shipped";

const VIEWS: readonly { readonly value: View; readonly label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "shipped", label: "Shipped" },
];

const ORDERS: readonly {
  readonly id: string;
  readonly item: string;
  readonly state: Exclude<View, "all">;
}[] = [
  { id: "1042", item: "2 bags of house blend", state: "open" },
  { id: "1041", item: "1 bag of decaf", state: "shipped" },
  { id: "1040", item: "A tasting set", state: "shipped" },
  { id: "1039", item: "3 bags of single origin", state: "shipped" },
];

/** A page header whose views are tabs that go to pages, over the orders in the view picked. */
export function OrdersPage(): ReactElement {
  const [view, setView] = useState<View>("all");
  const shown = ORDERS.filter(
    (order) => view === "all" || order.state === view,
  );
  const noun = shown.length === 1 ? "order" : "orders";
  return (
    <Stack gap={6}>
      <PageHeader title="Orders" value={String(ORDERS.length)}>
        <TabNav label="Order views">
          {VIEWS.map(({ value, label }) => (
            <TabNav.Link
              key={value}
              href={`#orders/${value}`}
              current={value === view}
              onClick={(event) => {
                event.preventDefault();
                setView(value);
              }}
            >
              {label}
            </TabNav.Link>
          ))}
        </TabNav>
      </PageHeader>
      <Stack gap={2}>
        <Text variant="label">
          {view === "all"
            ? `${String(shown.length)} ${noun}`
            : `${String(shown.length)} ${view} ${noun}`}
        </Text>
        {shown.map((order) => (
          <Text key={order.id} variant="body" tone="secondary">
            {`Order ${order.id} · ${order.item}`}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("4 orders");
  await press("link", "Shipped");
  await see("3 shipped orders");
  await press("link", "Open");
  await see("1 open order");
};
