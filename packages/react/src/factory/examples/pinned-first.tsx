import { Pin, PinOff } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { buttery, IconButton } from "@butteryui/react";

const DECKS = [
  "Quarterly review",
  "Spring launch",
  "Team offsite",
  "Hiring plan",
];

/** A list that keeps pinned decks first: each row glides to its new place through layout, with layoutDependency saying when it moved. */
export function PinnedFirst(): ReactElement {
  const [pinned, setPinned] = useState<readonly string[]>([]);
  const order = [...pinned, ...DECKS.filter((deck) => !pinned.includes(deck))];
  return (
    <Stack gap={3}>
      <Text variant="caption">{`${String(pinned.length)} pinned`}</Text>
      <Stack gap={2}>
        {order.map((deck, index) => {
          const isPinned = pinned.includes(deck);
          return (
            <buttery.div
              key={deck}
              surface="card"
              padX={4}
              padY={2}
              layout
              layoutDependency={index}
            >
              <Inline gap={3} align="center" justify="between">
                <Text variant="label" truncate>
                  {deck}
                </Text>
                <IconButton
                  icon={isPinned ? PinOff : Pin}
                  label={isPinned ? `Unpin ${deck}` : `Pin ${deck}`}
                  size="sm"
                  onClick={() => {
                    setPinned(
                      isPinned
                        ? pinned.filter((other) => other !== deck)
                        : [deck, ...pinned],
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
  await press("button", "Pin Team offsite");
  await see("1 pinned");
  await press("button", "Unpin Team offsite");
  await see("0 pinned");
};
