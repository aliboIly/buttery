import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, PasswordField } from "@butteryui/react";

/** A new password kept in state, its rules ticked off as it's typed, and Save held back until they're all met. */
export function NewPassword(): ReactElement {
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "A number", met: /\d/.test(password) },
  ];
  const ready = requirements.every((requirement) => requirement.met);
  return (
    <Stack gap={4}>
      <PasswordField
        label="Choose a password"
        autoComplete="new-password"
        value={password}
        onValueChange={(next) => {
          setPassword(next);
          setSaved(false);
        }}
        requirements={requirements}
      />
      <Inline gap={3} align="center">
        <Button
          variant="primary"
          aria-disabled={!ready}
          onClick={() => {
            setSaved(true);
          }}
        >
          Save password
        </Button>
        <Text variant="body-sm" tone="secondary">
          {saved ? "Password saved" : "Not saved yet"}
        </Text>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Choose a password", "roast2026");
  await press("button", "Save password");
  await see("Password saved");
};
