import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, FormDialog, TextField } from "@buttery/react";

/** Renaming a saved view, the save taking a moment: Submit waits for a new name, then shows busy until it's done. */
export function RenameSavedView(): ReactElement {
  const [name, setName] = useState("Unpaid");
  const [draft, setDraft] = useState(name);
  return (
    <Stack gap={2} align="start">
      <FormDialog
        trigger={<Button>Rename view</Button>}
        title="Rename the view"
        valid={draft.trim() !== "" && draft !== name}
        onSubmit={() =>
          new Promise<void>((resolve) => {
            window.setTimeout(() => {
              setName(draft.trim());
              resolve();
            }, 400);
          })
        }
        submitLabel="Rename"
      >
        <TextField label="View name" value={draft} onValueChange={setDraft} />
      </FormDialog>
      <Text variant="caption">{`View: ${name}`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Rename view");
  await type("View name", " this week");
  await press("button", "Rename");
  await see("View: Unpaid this week");
};
