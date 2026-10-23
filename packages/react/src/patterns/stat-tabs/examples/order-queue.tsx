import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { StatTabs } from "@butteryui/react";

type State = "unpaid" | "roasting" | "shipped";

const ORDERS: readonly {
  readonly id: string;
  readonly customer: string;
  readonly total: string;
  readonly state: State;
}[] = [
  { id: "1042", customer: "Corner Café", total: "$48.00", state: "roasting" },
  { id: "1043", customer: "Ines Moreau", total: "$22.50", state: "unpaid" },
  {
    id: "1044",
    customer: "Hill Street Bakery",
    total: "$96.00",
    state: "roasting",
  },
  { id: "1045", customer: "Tomás Reyes", total: "$18.00", state: "shipped" },
  { id: "1046", customer: "Ada Park", total: "$31.50", state: "shipped" },
];

function countOf(state: State | "all"): number {
  return ORDERS.filter((order) => state === "all" || order.state === state)
    .length;
}

/** An order queue opened on what needs a look: the tabs split the list by state, each with its count. */
export function OrderQueue(): ReactElement {
  const [state, setState] = useState("unpaid");
  const shown = ORDERS.filter(
    (order) => state === "all" || order.state === state,
  );
  return (
    <Stack gap={4}>
      <StatTabs
        label="Orders by state"
        tabs={[
          { value: "all", label: "All", count: countOf("all") },
          { value: "unpaid", label: "Unpaid", count: countOf("unpaid") },
          { value: "roasting", label: "Roasting", count: countOf("roasting") },
          { value: "shipped", label: "Shipped", count: countOf("shipped") },
        ]}
        value={state}
        onValueChange={setState}
      />
      <Surface level="card" pad={4}>
        <Stack gap={3}>
          {shown.map((order) => (
            <Inline key={order.id} gap={4} justify="between">
              <Text variant="body">{`Order ${order.id}, ${order.customer}`}</Text>
              <Text variant="body" tone="secondary" tabular>
                {order.total}
              </Text>
            </Inline>
          ))}
        </Stack>
      </Surface>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Order 1043, Ines Moreau");
  await press("combobox", /^Orders by state/);
  await press("option", "Shipped · 2");
  await see("Order 1045, Tomás Reyes");
};
