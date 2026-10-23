import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SidePanel } from "@buttery/react";

/** An order's notes, whether they're open kept in state: closed, a button brings them back, and their menu clears them. */
export function OrderNotes(): ReactElement {
  const [open, setOpen] = useState(true);
  const [notes, setNotes] = useState<readonly string[]>([
    "Grind for a moka pot.",
    "Leave it with the café next door.",
  ]);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        blockSize: "calc(var(--bt-bento-row) * 2)",
      }}
    >
      {open ? null : (
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          Show the notes
        </Button>
      )}
      <SidePanel
        title="Order notes"
        open={open}
        onOpenChange={setOpen}
        menu={
          <Menu.Item
            tone="danger"
            onSelect={() => {
              setNotes([]);
            }}
          >
            Clear the notes
          </Menu.Item>
        }
      >
        {notes.length === 0 ? (
          <Text variant="body-sm">No notes yet</Text>
        ) : (
          notes.map((note) => (
            <Text key={note} variant="body-sm">
              {note}
            </Text>
          ))
        )}
      </SidePanel>
    </div>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More actions");
  await press("menuitem", "Clear the notes");
  await see("No notes yet");
  await press("button", "Close");
  await press("button", "Show the notes");
  await see("No notes yet");
};
