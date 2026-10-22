import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Menu, Pressable, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A card's less common actions behind one trigger, with the destructive one set apart in danger. */
export function CardActions(): ReactElement {
  const [last, setLast] = useState("Nothing chosen yet");
  return (
    <Inline gap={3} align="center">
      <Menu>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Menu.Trigger asChild>
            <Pressable>
              <Text variant="button">Card actions</Text>
            </Pressable>
          </Menu.Trigger>
        </Surface>
        <Menu.Content>
          <Menu.Item
            onSelect={() => {
              setLast("Duplicated the card");
            }}
          >
            Duplicate
          </Menu.Item>
          <Menu.Item
            onSelect={() => {
              setLast("Moved the card to Drafts");
            }}
          >
            Move to Drafts
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item
            tone="danger"
            onSelect={() => {
              setLast("Deleted the card");
            }}
          >
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <Text variant="caption">{last}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Card actions");
  await press("menuitem", "Duplicate");
  await see("Duplicated the card");
};
