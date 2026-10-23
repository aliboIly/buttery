import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, buttery } from "@butteryui/react";

/** Each note is one element given a card surface, padding and a column, rising in as it mounts and lifting on hover. */
export function SpeakerNotes(): ReactElement {
  const [notes, setNotes] = useState<readonly string[]>([]);
  return (
    <Stack gap={3}>
      <Inline>
        <Button
          onClick={() => {
            setNotes([...notes, `Speaker note ${String(notes.length + 1)}`]);
          }}
        >
          Add a speaker note
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
          <Text variant="caption">Pause here for questions.</Text>
        </buttery.article>
      ))}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a speaker note");
  await see("Speaker note 1");
  await press("button", "Add a speaker note");
  await see("Speaker note 2");
};
