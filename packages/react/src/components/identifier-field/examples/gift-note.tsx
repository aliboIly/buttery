import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, IdentifierField } from "@butteryui/react";

/** Both looks: the outlined field for who's buying, and a soft one for who the bag is a gift for. */
export function GiftNote(): ReactElement {
  const [recipient, setRecipient] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(recipient);
      }}
    >
      <Stack gap={4}>
        <IdentifierField
          label="Your email or phone number"
          defaultValue="rosa@halfmoon.coffee"
        />
        <IdentifierField
          variant="soft"
          label="Who the gift is for"
          value={recipient}
          onValueChange={setRecipient}
        />
        <Button type="submit" variant="primary">
          Send a gift note
        </Button>
        {sent === null ? null : (
          <Text variant="body" tone="secondary">
            {`We'll tell ${sent} a bag is on its way.`}
          </Text>
        )}
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Who the gift is for", "5035550142");
  await press("button", "Send a gift note");
  await see("We'll tell (503) 555-0142 a bag is on its way.");
};
