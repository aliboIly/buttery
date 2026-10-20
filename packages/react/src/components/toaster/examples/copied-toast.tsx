import type { ReactElement } from "react";
import { Button, toast } from "@buttery/react";

/** A copy button that confirms with one toast, however often it's pressed: the id replaces the last one. */
export function CopiedToast(): ReactElement {
  return (
    <Button
      onClick={() => {
        void navigator.clipboard
          .writeText("https://example.com/cards/42")
          .then(() => toast("Link copied", { id: "copy-link" }))
          .catch(() => toast("Couldn't copy the link", { id: "copy-link" }));
      }}
    >
      Copy the link
    </Button>
  );
}
