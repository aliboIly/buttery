import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Pressable, Surface, Text } from "@buttery/core";

const ORDERS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name",
} as const;

function isOrder(value: string): value is keyof typeof ORDERS {
  return Object.hasOwn(ORDERS, value);
}

/** A sort order picked from a radio group, applied as soon as it's chosen. */
export function SortOrder(): ReactElement {
  const [order, setOrder] = useState<keyof typeof ORDERS>("newest");
  return (
    <Menu>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Menu.Trigger asChild>
          <Pressable>
            <Text variant="button">{ORDERS[order]}</Text>
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
  );
}
