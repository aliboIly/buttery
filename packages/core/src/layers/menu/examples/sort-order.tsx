import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const ORDERS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name",
} as const;

type Order = keyof typeof ORDERS;

interface Card {
  readonly name: string;
  readonly added: number;
}

const CARDS: readonly Card[] = [
  { name: "Weekend tasting", added: 3 },
  { name: "Autumn blend", added: 1 },
  { name: "Brew guide", added: 2 },
];

const COMPARE: Readonly<Record<Order, (a: Card, b: Card) => number>> = {
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
    <Stack gap={3} align="start">
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
      <Stack gap={2}>
        {[...CARDS].sort(COMPARE[order]).map((card) => (
          <Text key={card.name} variant="body">
            {card.name}
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
