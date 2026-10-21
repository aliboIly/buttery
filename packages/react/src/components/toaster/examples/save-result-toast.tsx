import type { ReactElement } from "react";
import { Button, toast } from "@buttery/react";

/** A save that confirms with a success toast or explains a failure with a danger one, under one id. */
export function SaveResultToast(): ReactElement {
  return (
    <Button
      onClick={() => {
        void fetch("/api/roasts/42", { method: "PUT" })
          .then((response) => {
            if (!response.ok) throw new Error(response.statusText);
            toast.success("Roast saved", { id: "save" });
          })
          .catch(() => {
            toast.danger("Couldn't save the roast", { id: "save" });
          });
      }}
    >
      Save roast
    </Button>
  );
}
