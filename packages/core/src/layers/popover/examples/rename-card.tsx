import { useId, useState } from "react";
import type { ReactElement } from "react";
import {
  Control,
  Inline,
  Popover,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A popover whose open state lives in the example, so the form inside can close it once the card is renamed. */
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
              <Surface asChild level="inset">
                <Control asChild>
                  <input id={inputId} name="title" defaultValue={title} />
                </Control>
              </Surface>
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

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Rename Spring launch");
  await type("Title", "{selectall}Summer menu");
  await press("button", "Save");
  await see("Summer menu");
};
