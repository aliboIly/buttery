import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Dialog, toast } from "@buttery/react";

/** A confirmation before something can't be undone, with the safe choice first, where focus lands. */
export function DeleteConfirm(): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="soft">Delete price list</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Text
          title="Delete the holiday price list?"
          body="The 8 cafés on it go back to your standard prices."
        />
        <Dialog.Actions>
          <Dialog.Close asChild>
            <Button variant="soft" size="cta" shape="rounded">
              Keep it
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              variant="primary"
              size="cta"
              shape="rounded"
              onClick={() => {
                toast("Price list deleted");
              }}
            >
              Delete
            </Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Delete price list");
  await see("Delete the holiday price list?");
  await press("button", "Delete");
  await see("Price list deleted");
};
