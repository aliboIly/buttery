import { Pin, PinOff } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { buttery, IconButton } from "@buttery/react";

const COFFEES = ["Harbor blend", "Guji natural", "Night shift", "Huila honey"];

/** A list that keeps pinned coffees first: each row glides to its new place with layout, told when by layoutDependency. */
export function PinnedFirst(): ReactElement {
  const [pinned, setPinned] = useState<readonly string[]>([]);
  const order = [
    ...pinned,
    ...COFFEES.filter((coffee) => !pinned.includes(coffee)),
  ];
  return (
    <Stack gap={3}>
      <Text variant="caption">{`${String(pinned.length)} pinned`}</Text>
      <Stack gap={2}>
        {order.map((coffee, index) => {
          const isPinned = pinned.includes(coffee);
          return (
            <buttery.div
              key={coffee}
              surface="card"
              padX={4}
              padY={2}
              layout
              layoutDependency={index}
            >
              <Inline gap={3} align="center" justify="between">
                <Text variant="label" truncate>
                  {coffee}
                </Text>
                <IconButton
                  icon={isPinned ? PinOff : Pin}
                  label={isPinned ? `Unpin ${coffee}` : `Pin ${coffee}`}
                  size="sm"
                  onClick={() => {
                    setPinned(
                      isPinned
                        ? pinned.filter((other) => other !== coffee)
                        : [coffee, ...pinned],
                    );
                  }}
                />
              </Inline>
            </buttery.div>
          );
        })}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Pin Night shift");
  await see("1 pinned");
  await press("button", "Unpin Night shift");
  await see("0 pinned");
};
