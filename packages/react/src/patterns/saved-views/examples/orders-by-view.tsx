import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SavedViews } from "@butteryui/react";

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly total: string;
  readonly paid: boolean;
  readonly wholesale: boolean;
}

const ORDERS: readonly Order[] = [
  {
    id: "1042",
    customer: "Corner Café",
    total: "$48.00",
    paid: true,
    wholesale: true,
  },
  {
    id: "1043",
    customer: "Ines Moreau",
    total: "$22.50",
    paid: false,
    wholesale: false,
  },
  {
    id: "1044",
    customer: "Hill Street Bakery",
    total: "$96.00",
    paid: false,
    wholesale: true,
  },
  {
    id: "1045",
    customer: "Tomás Reyes",
    total: "$18.00",
    paid: true,
    wholesale: false,
  },
];

const VIEWS = [
  { id: "all", label: "All orders", shows: (): boolean => true },
  {
    id: "unpaid",
    label: "Unpaid",
    shows: (order: Order): boolean => !order.paid,
  },
  {
    id: "wholesale",
    label: "Wholesale",
    shows: (order: Order): boolean => order.wholesale,
  },
];

/** Saved views over an orders list: choosing one shows the orders it keeps. */
export function OrdersByView(): ReactElement {
  const [view, setView] = useState("unpaid");
  const shows = VIEWS.find((candidate) => candidate.id === view)?.shows;
  return (
    <Stack gap={4}>
      <SavedViews
        label="Order views"
        views={VIEWS}
        value={view}
        onValueChange={setView}
      />
      <Surface level="card" pad={4}>
        <Stack gap={3}>
          {ORDERS.filter((order) => shows?.(order) ?? true).map((order) => (
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
  await press("radio", "Wholesale");
  await see("Order 1042, Corner Café");
};
