import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, FormDialog, TextField } from "@buttery/react";

interface Card {
  readonly id: number;
  readonly name: string;
}

/** A dialog opened from code with open: Duplicate makes the copy, then asks what to call it. */
export function NameTheCopy(): ReactElement {
  const [cards, setCards] = useState<readonly Card[]>([
    { id: 1, name: "Spring launch" },
  ]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const copy = cards.at(-1);
  return (
    <Stack gap={3} align="start">
      <Button
        onClick={() => {
          const name = `${copy?.name ?? "Untitled"} copy`;
          setCards([...cards, { id: cards.length + 1, name }]);
          setDraft(name);
          setOpen(true);
        }}
      >
        Duplicate
      </Button>
      <Stack gap={1}>
        {cards.map((card) => (
          <Text key={card.id} variant="body-sm">
            {card.name}
          </Text>
        ))}
      </Stack>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Name the copy"
        valid={draft.trim() !== ""}
        onSubmit={() => {
          setCards(
            cards.map((card) =>
              card.id === copy?.id ? { ...card, name: draft.trim() } : card,
            ),
          );
        }}
        submitLabel="Save name"
        cancelLabel="Keep this name"
      >
        <TextField label="Card name" value={draft} onValueChange={setDraft} />
      </FormDialog>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Duplicate");
  await type("Card name", " for May");
  await press("button", "Save name");
  await see("Spring launch copy for May");
};
