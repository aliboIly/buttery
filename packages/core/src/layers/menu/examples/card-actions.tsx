import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Menu, Pressable, Surface, Text } from "@buttery/core";

/** A card's less common actions behind one trigger, with the destructive one set apart. */
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
              setLast("Duplicated");
            }}
          >
            Duplicate
          </Menu.Item>
          <Menu.Item
            onSelect={() => {
              setLast("Renamed");
            }}
          >
            Rename
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item
            onSelect={() => {
              setLast("Deleted");
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
