import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  Button,
  Checkbox,
  IdentifierField,
  validIdentifier,
} from "@butteryui/react";

/** Where a café sends a receipt: an email or a phone, with a box to keep it for next time. */
export function ReceiptForm(): ReactElement {
  const [to, setTo] = useState("");
  const [sent, setSent] = useState("");
  return (
    <Surface level="card" pad={5} radius="auto">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (validIdentifier(to)) setSent(to);
        }}
      >
        <Stack gap={4}>
          <IdentifierField
            label="Where to send your receipt"
            value={to}
            onValueChange={setTo}
          />
          <Checkbox label="Remember it for next time" />
          <Button type="submit" variant="primary">
            Send receipt
          </Button>
          {sent === "" ? null : (
            <Text variant="body-sm" tone="secondary">{`Sent to ${sent}.`}</Text>
          )}
        </Stack>
      </form>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Where to send your receipt", "2155550134");
  await press("button", "Send receipt");
  await see("Sent to (215) 555-0134.");
};
