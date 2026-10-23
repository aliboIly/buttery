import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, IdentifierField } from "@butteryui/react";

/** A field the app fills with the email it remembers, and empties when someone wants another. */
export function Remembered(): ReactElement {
  const [identifier, setIdentifier] = useState("rosa@halfmoon.coffee");
  return (
    <Stack gap={3}>
      <IdentifierField value={identifier} onValueChange={setIdentifier} />
      <Stack gap={2} align="start">
        <Text variant="body-sm" tone="secondary">
          {identifier === ""
            ? "Nothing filled in."
            : `Signing in as ${identifier}.`}
        </Text>
        <Button
          variant="ghost"
          onClick={() => {
            setIdentifier("");
          }}
        >
          Use a different one
        </Button>
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Signing in as rosa@halfmoon.coffee.");
  await press("button", "Use a different one");
  await see("Nothing filled in.");
};
