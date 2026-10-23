import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { IdentifierField, TextField } from "@butteryui/react";

/** Nothing's said while it's typed; leave it unfinished and it says what it needs. */
export function LeftUnfinished(): ReactElement {
  return (
    <Stack gap={4}>
      <IdentifierField label="Where to send your receipt" />
      <TextField label="Note for the roaster" size="lg" />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ type, key, see }) => {
  await type("Where to send your receipt", "rosa@halfmoon");
  await key("Tab");
  await see(/Enter an email address or a phone number/);
};
