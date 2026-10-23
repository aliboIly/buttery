import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SignUpForm } from "@buttery/react";
import type { SignUpValues } from "@buttery/react";

async function createAccount({
  email,
}: SignUpValues): Promise<string | undefined> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600);
  });
  return email === "sam@example.com"
    ? "There's already an account for sam@example.com. Sign in instead."
    : undefined;
}

/** A sign-up page's form with the terms, handing its values to your own call and greeting the new account. */
export function SignUpPage(): ReactElement {
  const [name, setName] = useState<string | null>(null);
  if (name !== null)
    return (
      <Stack gap={3} align="start">
        <Text variant="body">{`Welcome, ${name}. Your account is ready.`}</Text>
        <Button
          onClick={() => {
            setName(null);
          }}
        >
          Sign out
        </Button>
      </Stack>
    );
  return (
    <SignUpForm
      description="Make decks and keep them in one place."
      termsHref="#terms"
      signInHref="#sign-in"
      onSubmit={async (values) => {
        const problem = await createAccount(values);
        if (problem === undefined) setName(values.name);
        return problem;
      }}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Create account");
  await see("Enter your name");
  await type("Name", "Ana");
  await type("Email", "ana@example.com");
  await type("Password", "roast2024");
  await press("checkbox", "I agree to the terms");
  await press("button", "Create account");
  await see("Welcome, Ana. Your account is ready.");
};
