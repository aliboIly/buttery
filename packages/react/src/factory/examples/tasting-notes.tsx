import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, buttery } from "@buttery/react";

/** Each note is one element given a card surface, padding and a column, rising in as it mounts and lifting on hover. */
export function TastingNotes(): ReactElement {
  const [notes, setNotes] = useState<readonly string[]>([]);
  return (
    <Stack gap={3}>
      <Inline>
        <Button
          onClick={() => {
            setNotes([...notes, `Tasting note ${String(notes.length + 1)}`]);
          }}
        >
          Add a tasting note
        </Button>
      </Inline>
      {notes.map((note) => (
        <buttery.article
          key={note}
          surface="card"
          pad={4}
          stack
          gap={1}
          enter="rise"
          hover="lift"
        >
          <Text variant="label">{note}</Text>
          <Text variant="caption">Bright, with a cocoa finish.</Text>
        </buttery.article>
      ))}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a tasting note");
  await see("Tasting note 1");
  await press("button", "Add a tasting note");
  await see("Tasting note 2");
};
