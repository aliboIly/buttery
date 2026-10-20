import type { ReactElement } from "react";
import { Menu, Pressable, Surface, Text } from "@buttery/core";

/** A card's less common actions behind one trigger, with the destructive one set apart. */
export function CardActions({
  onDuplicate,
  onRename,
  onDelete,
}: {
  readonly onDuplicate: () => void;
  readonly onRename: () => void;
  readonly onDelete: () => void;
}): ReactElement {
  return (
    <Menu>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Menu.Trigger asChild>
          <Pressable>
            <Text variant="button">Card actions</Text>
          </Pressable>
        </Menu.Trigger>
      </Surface>
      <Menu.Content>
        <Menu.Item onSelect={onDuplicate}>Duplicate</Menu.Item>
        <Menu.Item onSelect={onRename}>Rename</Menu.Item>
        <Menu.Separator />
        <Menu.Item onSelect={onDelete}>Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
