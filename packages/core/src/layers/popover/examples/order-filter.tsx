import { Check } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Icon,
  Inline,
  Popover,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const ROASTS = ["Light", "Medium", "Dark"] as const;

type Roast = (typeof ROASTS)[number];

const ORDERS: readonly {
  readonly id: number;
  readonly coffee: string;
  readonly roast: Roast;
}[] = [
  { id: 1, coffee: "Harbor blend", roast: "Medium" },
  { id: 2, coffee: "Kiambu washed", roast: "Light" },
  { id: 3, coffee: "Night shift", roast: "Dark" },
  { id: 4, coffee: "Guji natural", roast: "Light" },
  { id: 5, coffee: "Espresso no. 4", roast: "Dark" },
  { id: 6, coffee: "Huila honey", roast: "Medium" },
];

/** A list's filter in a popover beside its title: each roast it toggles filters the orders at once. */
export function OrderFilter(): ReactElement {
  const [roasts, setRoasts] = useState<readonly Roast[]>(ROASTS);
  const shown = ORDERS.filter((order) => roasts.includes(order.roast));
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center" justify="between">
        <Text variant="title">Orders</Text>
        <Popover>
          <Surface asChild level="raised" padX={4} padY={2} radius="full">
            <Popover.Trigger asChild>
              <Pressable>
                <Text variant="button">Filter</Text>
              </Pressable>
            </Popover.Trigger>
          </Surface>
          <Popover.Content align="end" aria-label="Filter by roast">
            <Stack gap={1}>
              {ROASTS.map((roast) => {
                const on = roasts.includes(roast);
                return (
                  <Surface
                    key={roast}
                    asChild
                    level="app"
                    padX={3}
                    padY={2}
                    radius="md"
                  >
                    <Inline asChild gap={3} justify="between" align="center">
                      <Pressable
                        aria-pressed={on}
                        onClick={() => {
                          setRoasts(
                            on
                              ? roasts.filter((other) => other !== roast)
                              : [...roasts, roast],
                          );
                        }}
                      >
                        <Text variant="menu">{roast}</Text>
                        {on ? <Icon icon={Check} /> : null}
                      </Pressable>
                    </Inline>
                  </Surface>
                );
              })}
            </Stack>
          </Popover.Content>
        </Popover>
      </Inline>
      <Text variant="caption">
        {`Showing ${String(shown.length)} of ${String(ORDERS.length)} orders`}
      </Text>
      <Stack gap={3}>
        {shown.map((order) => (
          <Inline key={order.id} gap={3} justify="between" align="baseline">
            <Text variant="body">{order.coffee}</Text>
            <Text variant="caption">{order.roast}</Text>
          </Inline>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Showing 6 of 6 orders");
  await press("button", "Filter");
  await press("button", "Dark");
  await see("Showing 4 of 6 orders");
};
