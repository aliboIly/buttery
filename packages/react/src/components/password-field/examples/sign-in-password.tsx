import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, PasswordField } from "@buttery/react";

/** The password on a sign-in form, filled in by the browser's saved password and read from the form when it's sent. */
export function SignInPassword(): ReactElement {
  const [error, setError] = useState<string | undefined>(undefined);
  const [signedIn, setSignedIn] = useState(false);
  const signIn = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    if (typeof password !== "string" || password === "") {
      setError("Enter your password.");
      return;
    }
    setError(undefined);
    setSignedIn(true);
  };
  return (
    <form onSubmit={signIn}>
      <Stack gap={4}>
        <PasswordField
          label="Password"
          name="password"
          size="lg"
          error={error}
        />
        <Button type="submit" variant="primary" size="cta">
          Sign in
        </Button>
        <Text variant="body-sm" tone="secondary">
          {signedIn ? "Signed in" : "Not signed in"}
        </Text>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Sign in");
  await see("Enter your password.");
  await type("Password", "roast-2026");
  await press("button", "Sign in");
  await see("Signed in");
};
