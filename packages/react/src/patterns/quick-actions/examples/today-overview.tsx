import { CalendarPlus, Plus, Send } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { PageHeader, QuickActions } from "@buttery/react";

/** Under an overview page's header, the day's shortcuts, each changing the page under them. */
export function TodayOverview(): ReactElement {
  const [orders, setOrders] = useState<readonly string[]>([
    "#1044 · Larkspur Café · to pack",
    "#1045 · Northgate Bakery · to pack",
  ]);
  const [roasts, setRoasts] = useState(1);
  const [invoiced, setInvoiced] = useState(false);
  return (
    <Stack gap={6}>
      <PageHeader
        title="Today"
        description={`${String(orders.length)} orders to pack and ${String(roasts)} ${roasts === 1 ? "roast" : "roasts"} planned`}
      >
        <QuickActions>
          <QuickActions.Action
            icon={Plus}
            label="New order"
            priority={2}
            onSelect={() => {
              setOrders([
                ...orders,
                `#${String(1044 + orders.length)} · Walk-in customer · to pack`,
              ]);
            }}
          />
          <QuickActions.Action
            icon={CalendarPlus}
            label="Plan a roast"
            priority={1}
            onSelect={() => {
              setRoasts(roasts + 1);
            }}
          />
          <QuickActions.Action
            icon={Send}
            label="Send invoices"
            disabled={invoiced}
            onSelect={() => {
              setInvoiced(true);
            }}
          />
        </QuickActions>
      </PageHeader>
      <Stack gap={2}>
        {orders.map((order) => (
          <Text key={order} variant="body-sm">
            {order}
          </Text>
        ))}
        {invoiced ? (
          <Text variant="caption">Invoices sent for this week</Text>
        ) : null}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New order");
  await see("#1046 · Walk-in customer · to pack");
  await see("3 orders to pack and 1 roast planned");
};
