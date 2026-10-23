import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { TextArea } from "@butteryui/react";

/** A note for the packing slip that grows as it gets longer, with the room it has left counted from its state. */
export function PackingSlipNote(): ReactElement {
  const [note, setNote] = useState("");
  return (
    <Stack gap={2}>
      <TextArea
        label="Note"
        hint="Printed on the packing slip in small type."
        value={note}
        onValueChange={setNote}
        maxLength={280}
      />
      <Text variant="caption" tone="secondary" tabular>
        {280 - note.length} characters left
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ type, see }) => {
  await see("280 characters left");
  await type("Note", "Thank you for your order");
  await see("256 characters left");
};
