import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, Stack, Sticky, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const CARDS = Array.from(
  { length: 16 },
  (_, index) => `Card ${String(index + 1)}`,
);

/** A header that stays at the top of its scrolling panel, counting the cards pinned below it. */
export function ScrollHeader(): ReactElement {
  const [pinned, setPinned] = useState<readonly string[]>([]);
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Recent cards"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <Sticky>
        <Surface level="card" padX={4} padY={3}>
          <Inline gap={3} justify="between" align="center">
            <Text variant="label">Recent cards</Text>
            <Text variant="caption">{`${String(pinned.length)} pinned`}</Text>
          </Inline>
        </Surface>
      </Sticky>
      <Stack gap={1} padX={2} padY={2}>
        {CARDS.map((card) => (
          <Surface key={card} asChild level="app" padX={3} padY={2} radius="md">
            <Pressable
              aria-pressed={pinned.includes(card)}
              onClick={() => {
                setPinned(
                  pinned.includes(card)
                    ? pinned.filter((other) => other !== card)
                    : [...pinned, card],
                );
              }}
            >
              <Text variant="body">{card}</Text>
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
  await press("button", "Card 4");
  await see("1 pinned");
  await press("button", "Card 12");
  await see("2 pinned");
};
