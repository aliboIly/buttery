import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, StatusBadge } from "@buttery/react";

const ORDERS: readonly { readonly id: string; readonly item: string }[] = [
  { id: "1042", item: "2 bags of house blend" },
  { id: "1043", item: "1 bag of decaf" },
  { id: "1044", item: "A tasting set" },
];

/** Orders in a list, each with its state; shipping one turns its badge from Roasting to Shipped. */
export function OrderList(): ReactElement {
  const [shipped, setShipped] = useState<readonly string[]>([]);
  return (
    <Stack gap={3}>
      {ORDERS.map((order) => {
        const done = shipped.includes(order.id);
        return (
          <Inline key={order.id} gap={3} justify="between">
            <Text truncate>{`Order ${order.id} · ${order.item}`}</Text>
            <Inline gap={2}>
              <StatusBadge tone={done ? "success" : "info"}>
                {done ? "Shipped" : "Roasting"}
              </StatusBadge>
              <Button
                size="sm"
                aria-label={`Ship order ${order.id}`}
                aria-disabled={done}
                onClick={() => {
                  setShipped([...shipped, order.id]);
                }}
              >
                Ship
              </Button>
            </Inline>
          </Inline>
        );
      })}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Ship order 1043");
  await see("Shipped");
};
