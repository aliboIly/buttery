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

/** A popover whose open state lives in the example, so the form inside can close it once the saved card has a nickname. */
export function RenameCard(): ReactElement {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("Card ending 4242");
  const inputId = useId();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Popover.Trigger asChild>
          <Pressable aria-label={`Rename ${nickname}`}>
            <Text variant="title-sm">{nickname}</Text>
          </Pressable>
        </Popover.Trigger>
      </Surface>
      <Popover.Content aria-label="Rename the card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("nickname");
            if (typeof value === "string" && value.trim() !== "")
              setNickname(value.trim());
            setOpen(false);
          }}
        >
          <Stack gap={3} pad={2}>
            <Stack gap={1}>
              <Text variant="label" asChild>
                <label htmlFor={inputId}>Nickname</label>
              </Text>
              <Surface asChild level="inset">
                <Control asChild>
                  <input id={inputId} name="nickname" defaultValue={nickname} />
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
  await press("button", "Rename Card ending 4242");
  await type("Nickname", "{selectall}Work card");
  await press("button", "Save");
  await see("Work card");
};
