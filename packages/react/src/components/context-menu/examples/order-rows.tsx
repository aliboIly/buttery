import { Receipt, Undo2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ContextMenu, StatusBadge } from "@buttery/react";

interface Order {
  readonly number: number;
  readonly cafe: string;
  readonly total: string;
  readonly paid: boolean;
}

const FIRST_ORDERS: readonly Order[] = [
  { number: 1042, cafe: "Little Fern Coffee", total: "$412.00", paid: false },
  { number: 1041, cafe: "Corner Table", total: "$96.50", paid: true },
  { number: 1039, cafe: "Northside Bakery", total: "$238.00", paid: false },
];

/** Wholesale orders as rows, each with its own menu: whether it's paid is kept in state, shown on the row and flipped from the menu or with P. */
export function OrderRows(): ReactElement {
  const [orders, setOrders] = useState<readonly Order[]>(FIRST_ORDERS);
  const [note, setNote] = useState(
    "Right-click an order, or focus it and press Shift+F10",
  );
  const markPaid = (number: number, paid: boolean): void => {
    setOrders(
      orders.map((order) =>
        order.number === number ? { ...order, paid } : order,
      ),
    );
  };
  return (
    <Stack gap={3}>
      <Text variant="caption">{note}</Text>
      <Stack gap={1} role="list" aria-label="Orders">
        {orders.map((order) => (
          <div key={order.number} role="listitem">
            <ContextMenu>
              <ContextMenu.Trigger asChild>
                <Surface asChild level="card" padX={4} padY={2} radius="md">
                  <Pressable
                    aria-label={`Order ${String(order.number)}, ${order.cafe}, ${order.total}, ${order.paid ? "paid" : "unpaid"}`}
                    onClick={() => {
                      setNote(`Order ${String(order.number)} is open`);
                    }}
                  >
                    <Inline gap={4} justify="between">
                      <Inline gap={3}>
                        <Text variant="label" tabular>
                          {String(order.number)}
                        </Text>
                        <Text variant="body" truncate>
                          {order.cafe}
                        </Text>
                      </Inline>
                      <Inline gap={3}>
                        <Text variant="body" tabular>
                          {order.total}
                        </Text>
                        <StatusBadge tone={order.paid ? "success" : "warning"}>
                          {order.paid ? "Paid" : "Unpaid"}
                        </StatusBadge>
                      </Inline>
                    </Inline>
                  </Pressable>
                </Surface>
              </ContextMenu.Trigger>
              <ContextMenu.Content aria-label={`Order ${String(order.number)}`}>
                <ContextMenu.CheckboxItem
                  shortcut="p"
                  checked={order.paid}
                  onCheckedChange={(paid) => {
                    markPaid(order.number, paid);
                  }}
                >
                  Paid
                </ContextMenu.CheckboxItem>
                <ContextMenu.Item
                  icon={Receipt}
                  onSelect={() => {
                    setNote(
                      `Sent the invoice for ${String(order.number)} to ${order.cafe}`,
                    );
                  }}
                >
                  Resend the invoice
                </ContextMenu.Item>
                <ContextMenu.Separator />
                <ContextMenu.Item
                  icon={Undo2}
                  tone="danger"
                  disabled={!order.paid}
                  onSelect={() => {
                    markPaid(order.number, false);
                    setNote(`Refunded ${order.total} to ${order.cafe}`);
                  }}
                >
                  Refund
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ focus, key, press, see }) => {
  await focus("button", /^Order 1042,/);
  await key("ContextMenu");
  await press("menuitemcheckbox", "Paid");
  await focus("button", /^Order 1042, .*, paid$/);
  await key("p");
  await focus("button", /^Order 1042, .*, unpaid$/);
  await focus("button", /^Order 1041,/);
  await key("ContextMenu");
  await press("menuitem", "Refund");
  await see("Refunded $96.50 to Corner Table");
};
