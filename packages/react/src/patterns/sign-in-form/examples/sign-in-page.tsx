import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SignInForm } from "@buttery/react";

async function signIn(email: string, password: string): Promise<boolean> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600);
  });
  return email === "sam@example.com" && password.length >= 8;
}

/** A sign-in page's form, handing its values to your own sign-in call and showing what it answers. */
export function SignInPage(): ReactElement {
  const [user, setUser] = useState<string | null>(null);
  if (user !== null)
    return (
      <Stack gap={3} align="start">
        <Text variant="body">{`Signed in as ${user}.`}</Text>
        <Button
          onClick={() => {
            setUser(null);
          }}
        >
          Sign out
        </Button>
      </Stack>
    );
  return (
    <SignInForm
      description="Welcome back to Deckhand."
      forgotPasswordHref="#forgot-password"
      signUpHref="#sign-up"
      onSubmit={async ({ email, password }) => {
        if (await signIn(email, password)) {
          setUser(email);
          return undefined;
        }
        return "That email and password don't match. Try sam@example.com with a password of 8 characters or more.";
      }}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Sign in");
  await see("Enter your email address");
  await type("Email", "sam@example.com");
  await type("Password", "roast-day");
  await press("button", "Sign in");
  await see("Signed in as sam@example.com.");
};
