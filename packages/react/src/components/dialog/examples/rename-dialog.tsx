import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Inline, Text } from "@buttery/core";
import { Button, Dialog, TextField } from "@buttery/react";

/** A short task in a controlled dialog: rename, then close it from the form's submit. */
export function RenameDialog(): ReactElement {
  const [name, setName] = useState("Spring launch");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(name);
  const save = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setName(draft.trim() === "" ? name : draft.trim());
    setOpen(false);
  };
  return (
    <Inline gap={3} align="center">
      <Text variant="label">{name}</Text>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft(name);
        }}
      >
        <Dialog.Trigger asChild>
          <Button variant="soft" size="sm">
            Rename
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <form onSubmit={save}>
            <Dialog.Text title="Rename the card" />
            <Dialog.Body>
              <TextField label="Name" value={draft} onValueChange={setDraft} />
            </Dialog.Body>
            <Dialog.Actions>
              <Button
                type="submit"
                variant="primary"
                size="cta"
                shape="rounded"
              >
                Save
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Content>
      </Dialog>
    </Inline>
  );
}
