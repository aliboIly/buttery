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

const SIZES = ["Wallet", "Postcard", "Square"] as const;

/** A trigger that opens the gift card's printed sizes; picking one closes the popover and shows on the trigger. */
export function GiftCardSize(): ReactElement {
  const [size, setSize] = useState<(typeof SIZES)[number]>("Wallet");
  return (
    <Popover>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Popover.Trigger asChild>
          <Pressable>
            <Text variant="button">{`Gift card: ${size}`}</Text>
          </Pressable>
        </Popover.Trigger>
      </Surface>
      <Popover.Content align="start" aria-label="Gift card sizes">
        <Stack gap={1}>
          {SIZES.map((option) => (
            <Surface
              key={option}
              asChild
              level="app"
              padX={3}
              padY={2}
              radius="md"
            >
              <Inline asChild gap={3} justify="between" align="center">
                <Popover.Close asChild>
                  <Pressable
                    aria-pressed={option === size}
                    onClick={() => {
                      setSize(option);
                    }}
                  >
                    <Text variant="menu">{option}</Text>
                    {option === size ? <Icon icon={Check} /> : null}
                  </Pressable>
                </Popover.Close>
              </Inline>
            </Surface>
          ))}
        </Stack>
      </Popover.Content>
    </Popover>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Gift card: Wallet");
  await press("button", "Postcard");
  await see("Gift card: Postcard");
};
