import { KeyRound } from "lucide-react";
import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, PasswordField } from "@butteryui/react";

/** A soft md password among an app's settings, and an lg one, 48px with 16px text, for a sign-in page. */
export function TwoSizes(): ReactElement {
  const [signedIn, setSignedIn] = useState(false);
  const signIn = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    setSignedIn(typeof password === "string" && password !== "");
  };
  return (
    <Stack gap={6}>
      <PasswordField
        label="Café Wi-Fi password"
        hint="Staff read it out to customers who ask."
        revealLabel="Show the Wi-Fi password"
        variant="soft"
        autoComplete="off"
        defaultValue="morning-roast"
      />
      <form onSubmit={signIn}>
        <Stack gap={3}>
          <PasswordField
            label="Password"
            name="password"
            size="lg"
            iconStart={KeyRound}
          />
          <Button type="submit" variant="primary" size="cta">
            Sign in
          </Button>
          <Text variant="body-sm" tone="secondary">
            {signedIn ? "Signed in" : "Not signed in"}
          </Text>
        </Stack>
      </form>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Show the Wi-Fi password");
  await type("Password", "harvest-2026");
  await press("button", "Sign in");
  await see("Signed in");
};
