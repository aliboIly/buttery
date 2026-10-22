import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
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

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("button", "Save roast");
  await see(/^(Roast saved|Couldn't save the roast)$/);
  await key("F8");
  await key("Escape");
};
