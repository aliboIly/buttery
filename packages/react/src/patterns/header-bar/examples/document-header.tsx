import { Redo2, RectangleHorizontal, Undo2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Icon, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { FormDialog, HeaderBar, IconButton, TextField } from "@buttery/react";

/** An editor's header over its canvas: Rename opens a form dialog, and Undo and Redo, after a separator, walk back through the names. */
export function DocumentHeader(): ReactElement {
  const [names, setNames] = useState<readonly string[]>(["Spring launch"]);
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const name = names[at] ?? "Untitled";
  return (
    <Stack gap={3}>
      <HeaderBar mark={<Icon icon={RectangleHorizontal} />} title={name}>
        <HeaderBar.Actions>
          <HeaderBar.Action
            label="Rename"
            onSelect={() => {
              setDraft(name);
              setOpen(true);
            }}
          />
        </HeaderBar.Actions>
        <HeaderBar.Separator />
        <IconButton
          icon={Undo2}
          label="Undo"
          aria-disabled={at === 0}
          onClick={() => {
            if (at > 0) setAt(at - 1);
          }}
        />
        <IconButton
          icon={Redo2}
          label="Redo"
          aria-disabled={at === names.length - 1}
          onClick={() => {
            if (at < names.length - 1) setAt(at + 1);
          }}
        />
      </HeaderBar>
      <Surface level="card" padX={8} padY={10}>
        <Text variant="title">{name}</Text>
      </Surface>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Rename the deck"
        valid={draft.trim() !== "" && draft.trim() !== name}
        onSubmit={() => {
          setNames([...names.slice(0, at + 1), draft.trim()]);
          setAt(at + 1);
        }}
        submitLabel="Save name"
      >
        <TextField label="Deck name" value={draft} onValueChange={setDraft} />
      </FormDialog>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Rename");
  await type("Deck name", " 2026");
  await press("button", "Save name");
  await see("Spring launch 2026");
};
