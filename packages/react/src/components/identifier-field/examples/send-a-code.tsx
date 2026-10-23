import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, IdentifierField, validIdentifier } from "@butteryui/react";

/** An email or a phone number, formatted as it's typed, with a button that waits until it's whole. */
export function SendACode(): ReactElement {
  const [identifier, setIdentifier] = useState("");
  const ready = validIdentifier(identifier);
  const phone = /^[+\d\s().-]+$/.test(identifier);
  return (
    <Stack gap={4}>
      <IdentifierField value={identifier} onValueChange={setIdentifier} />
      <Text variant="body-sm" tone="secondary">
        {ready
          ? `We'll ${phone ? "text" : "email"} a code to ${identifier}.`
          : "We'll send a code to sign you in."}
      </Text>
      <Button variant="primary" size="cta" aria-disabled={!ready || undefined}>
        Continue
      </Button>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ type, see }) => {
  await type("Email or phone number", "5035550142");
  await see("We'll text a code to (503) 555-0142.");
};
