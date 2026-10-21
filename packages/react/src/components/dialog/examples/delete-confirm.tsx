import type { ReactElement } from "react";
import { Button, Dialog, toast } from "@buttery/react";

/** A confirmation before something can't be undone, with the safe choice first, where focus lands. */
export function DeleteConfirm(): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="soft">Delete card</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Text
          title="Delete this card?"
          body="It stays in the trash for 30 days."
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
                toast("Card deleted");
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
