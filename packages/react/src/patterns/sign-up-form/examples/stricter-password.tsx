import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SignUpForm, defaultPasswordRules } from "@butteryui/react";

/** A sign-up form that adds a rule to buttery's password rules. */
export function StricterPassword(): ReactElement {
  const [created, setCreated] = useState<string | null>(null);
  return (
    <Stack gap={4}>
      <SignUpForm
        passwordRules={[
          ...defaultPasswordRules,
          {
            label: "A capital letter",
            test: (password) => /[A-Z]/.test(password),
          },
        ]}
        onSubmit={({ email }) => {
          setCreated(email);
          return undefined;
        }}
      />
      {created === null ? null : (
        <Text variant="body">{`Account created for ${created}.`}</Text>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Name", "Ana");
  await type("Email", "ana@example.com");
  await type("Password", "roast2024");
  await press("button", "Create account");
  await see("Choose a password that meets every rule");
  await type("Password", "R");
  await press("button", "Create account");
  await see("Account created for ana@example.com.");
};
