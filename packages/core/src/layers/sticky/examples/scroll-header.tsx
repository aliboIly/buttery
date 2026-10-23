import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, Stack, Sticky, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const ORDERS = Array.from(
  { length: 16 },
  (_, index) => `Order ${String(index + 1041)}`,
);

/** A header that stays at the top of its scrolling panel, counting the orders pinned below it. */
export function ScrollHeader(): ReactElement {
  const [pinned, setPinned] = useState<readonly string[]>([]);
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Recent orders"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <Sticky>
        <Surface level="card" padX={4} padY={3}>
          <Inline gap={3} justify="between" align="center">
            <Text variant="label">Recent orders</Text>
            <Text variant="caption">{`${String(pinned.length)} pinned`}</Text>
          </Inline>
        </Surface>
      </Sticky>
      <Stack gap={1} padX={2} padY={2}>
        {ORDERS.map((order) => (
          <Surface
            key={order}
            asChild
            level="app"
            padX={3}
            padY={2}
            radius="md"
          >
            <Pressable
              aria-pressed={pinned.includes(order)}
              onClick={() => {
                setPinned(
                  pinned.includes(order)
                    ? pinned.filter((other) => other !== order)
                    : [...pinned, order],
                );
              }}
            >
              <Text variant="menu">{order}</Text>
            </Pressable>
          </Surface>
        ))}
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("0 pinned");
  await press("button", "Order 1044");
  await see("1 pinned");
  await press("button", "Order 1052");
  await see("2 pinned");
};
