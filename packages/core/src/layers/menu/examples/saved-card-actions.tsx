import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Menu, Pressable, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A saved payment card's less common actions behind one trigger, with the destructive one set apart in danger. */
export function SavedCardActions(): ReactElement {
  const [last, setLast] = useState("Nothing chosen yet");
  return (
    <Inline gap={3} align="center">
      <Menu>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Menu.Trigger asChild>
            <Pressable>
              <Text variant="button">Manage card</Text>
            </Pressable>
          </Menu.Trigger>
        </Surface>
        <Menu.Content>
          <Menu.Item
            onSelect={() => {
              setLast("Card ending 4242 is now your default");
            }}
          >
            Make default
          </Menu.Item>
          <Menu.Item
            onSelect={() => {
              setLast("Subscriptions now use card ending 4242");
            }}
          >
            Use for subscriptions
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item
            tone="danger"
            onSelect={() => {
              setLast("Removed card ending 4242");
            }}
          >
            Remove card
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <Text variant="caption">{last}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Manage card");
  await press("menuitem", "Make default");
  await see("Card ending 4242 is now your default");
};
