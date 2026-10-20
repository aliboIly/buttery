import { useId, useState } from "react";
import type { ReactElement } from "react";
import {
  Inline,
  Popover,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";

/** A controlled popover holding a small form. */
export function RenameCard(): ReactElement {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Spring launch");
  const inputId = useId();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Popover.Trigger asChild>
          <Pressable aria-label={`Rename ${title}`}>
            <Text variant="title-sm">{title}</Text>
          </Pressable>
        </Popover.Trigger>
      </Surface>
      <Popover.Content aria-label="Rename the card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("title");
            if (typeof value === "string" && value.trim() !== "")
              setTitle(value.trim());
            setOpen(false);
          }}
        >
          <Stack gap={3} pad={2}>
            <Stack gap={1}>
              <Text variant="label" asChild>
                <label htmlFor={inputId}>Title</label>
              </Text>
              <input id={inputId} name="title" defaultValue={title} />
            </Stack>
            <Inline justify="end">
              <Surface asChild level="raised" padX={4} padY={2} radius="full">
                <Pressable type="submit">
                  <Text variant="button">Save</Text>
                </Pressable>
              </Surface>
            </Inline>
          </Stack>
        </form>
      </Popover.Content>
    </Popover>
  );
}
