import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button } from "@butteryui/react";

/** A form's closing pair: the main action in primary, the way out in soft. */
export function SaveAndCancel(): ReactElement {
  const [note, setNote] = useState("You have unsaved changes");
  return (
    <Stack gap={3} align="start">
      <Text variant="body" tone="secondary">
        {note}
      </Text>
      <Inline gap={2}>
        <Button
          onClick={() => {
            setNote("Changes discarded");
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setNote("Changes saved");
          }}
        >
          Save changes
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Save changes");
  await see("Changes saved");
};
