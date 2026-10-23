import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Pressable, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const ORDERS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name",
} as const;

type Order = keyof typeof ORDERS;

interface Coffee {
  readonly name: string;
  readonly added: number;
}

const COFFEES: readonly Coffee[] = [
  { name: "Nyeri", added: 3 },
  { name: "Huila", added: 1 },
  { name: "Cerrado", added: 2 },
];

const COMPARE: Readonly<Record<Order, (a: Coffee, b: Coffee) => number>> = {
  newest: (a, b) => b.added - a.added,
  oldest: (a, b) => a.added - b.added,
  name: (a, b) => a.name.localeCompare(b.name),
};

function isOrder(value: string): value is Order {
  return Object.hasOwn(ORDERS, value);
}

/** A sort order kept in state and picked from a radio group, applied to the list as soon as it's chosen. */
export function SortOrder(): ReactElement {
  const [order, setOrder] = useState<Order>("newest");
  return (
    <Stack gap={4} align="start">
      <Menu>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Menu.Trigger asChild>
            <Pressable>
              <Text variant="button">{`Sort: ${ORDERS[order]}`}</Text>
            </Pressable>
          </Menu.Trigger>
        </Surface>
        <Menu.Content align="start">
          <Menu.RadioGroup
            label="Sort by"
            value={order}
            onValueChange={(next) => {
              if (isOrder(next)) setOrder(next);
            }}
          >
            {Object.entries(ORDERS).map(([value, label]) => (
              <Menu.RadioItem key={value} value={value}>
                {label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>
      <Stack gap={3}>
        {[...COFFEES].sort(COMPARE[order]).map((coffee) => (
          <Text key={coffee.name} variant="body">
            {coffee.name}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Sort: Newest first");
  await press("menuitemradio", "Name");
  await see("Sort: Name");
};
