import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, FormDialog, TextField } from "@butteryui/react";

interface PriceList {
  readonly id: number;
  readonly name: string;
}

/** A dialog opened from code with open: Duplicate makes the copy, then asks what to call it. */
export function NameTheCopy(): ReactElement {
  const [lists, setLists] = useState<readonly PriceList[]>([
    { id: 1, name: "Café price list" },
  ]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const copy = lists.at(-1);
  return (
    <Stack gap={3} align="start">
      <Button
        onClick={() => {
          const name = `${copy?.name ?? "Untitled"} copy`;
          setLists([...lists, { id: lists.length + 1, name }]);
          setDraft(name);
          setOpen(true);
        }}
      >
        Duplicate
      </Button>
      <Stack gap={1}>
        {lists.map((list) => (
          <Text key={list.id} variant="body-sm">
            {list.name}
          </Text>
        ))}
      </Stack>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Name the copy"
        valid={draft.trim() !== ""}
        onSubmit={() => {
          setLists(
            lists.map((list) =>
              list.id === copy?.id ? { ...list, name: draft.trim() } : list,
            ),
          );
        }}
        submitLabel="Save name"
        cancelLabel="Keep this name"
      >
        <TextField label="List name" value={draft} onValueChange={setDraft} />
      </FormDialog>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Duplicate");
  await type("List name", " for May");
  await press("button", "Save name");
  await see("Café price list copy for May");
};
