import { Button, Dialog, TextField } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";

/** A small dialog that renames the saved view shown, from its "…" menu. */
export function RenameView({
  open,
  onOpenChange,
  name,
  onRename,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly name: string;
  readonly onRename: (name: string) => void;
}): ReactElement {
  const [draft, setDraft] = useState(name);
  const [shown, setShown] = useState(open);

  if (open !== shown) {
    setShown(open);
    if (open) setDraft(name);
  }

  const save = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (draft.trim() !== "") onRename(draft.trim());
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <form onSubmit={save}>
          <Dialog.Text title="Rename this view" />
          <Dialog.Body>
            <TextField label="Name" value={draft} onValueChange={setDraft} />
          </Dialog.Body>
          <Dialog.Actions>
            <Button type="submit" variant="primary" size="cta" shape="rounded">
              Save
            </Button>
          </Dialog.Actions>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
