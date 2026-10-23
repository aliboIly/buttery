import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  AppPage,
  ArrowLink,
  Button,
  EmptyState,
  PageHeader,
} from "@butteryui/react";
import { Receipt } from "lucide-react";

/** An app page with nothing in it yet: an icon tile, the way to add some, and where to read more. */
export function NoOrders(): ReactElement {
  const [orders, setOrders] = useState<readonly number[]>([]);
  const add = (): void => {
    setOrders((current) => [...current, 1001 + current.length]);
  };
  return (
    <AppPage header={<PageHeader title="Orders" />}>
      <AppPage.Section
        title="Today"
        actions={
          orders.length === 0 ? null : (
            <Button size="sm" onClick={add}>
              Add an order
            </Button>
          )
        }
      >
        {orders.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No orders yet"
            description="Orders show up here once a customer checks out, or when you add one by hand."
            docs={<ArrowLink href="#orders-guide">How orders work</ArrowLink>}
            actions={
              <Button variant="primary" onClick={add}>
                Add an order
              </Button>
            }
          />
        ) : (
          <Stack gap={1}>
            {orders.map((order) => (
              <Text key={order} variant="body">
                {`Order ${String(order)}, added by hand`}
              </Text>
            ))}
          </Stack>
        )}
      </AppPage.Section>
    </AppPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No orders yet");
  await press("button", "Add an order");
  await see("Order 1001, added by hand");
};
