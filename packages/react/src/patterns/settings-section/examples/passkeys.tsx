import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SettingsSection } from "@butteryui/react";

const DEVICES = ["This laptop", "Your phone", "A security key"];

/** A section with a heading, one line about it, its one action at the end of the heading's row, and its content. */
export function Passkeys(): ReactElement {
  const [added, setAdded] = useState(0);
  const full = added === DEVICES.length;
  return (
    <SettingsSection
      title="Passkeys"
      description="Sign in with your fingerprint or a security key."
      action={
        <Button
          size="sm"
          aria-disabled={full || undefined}
          onClick={() => {
            setAdded(added + 1);
          }}
        >
          Add a passkey
        </Button>
      }
    >
      {added === 0 ? (
        <Text variant="body-sm">No passkeys yet.</Text>
      ) : (
        DEVICES.slice(0, added).map((device) => (
          <Text key={device} variant="body-sm">
            {`${device}, added today`}
          </Text>
        ))
      )}
    </SettingsSection>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No passkeys yet.");
  await press("button", "Add a passkey");
  await see("This laptop, added today");
  await press("button", "Add a passkey");
  await see("Your phone, added today");
};
