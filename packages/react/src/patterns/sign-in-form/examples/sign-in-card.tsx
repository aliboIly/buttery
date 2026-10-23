import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SignInForm } from "@buttery/react";
import { KeyRound, Mail } from "lucide-react";

async function signIn(email: string, password: string): Promise<boolean> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600);
  });
  return email === "sam@example.com" && password.length >= 8;
}

/** A sign-in page's card: the form with a passkey and an emailed link as other ways in, and what each one did. */
export function SignInCard(): ReactElement {
  const [note, setNote] = useState("");
  return (
    <Stack gap={4} align="center">
      <Surface level="card" pad={8}>
        <SignInForm
          titleAs="h2"
          title="Sign in to Deckhand"
          description="Every deck you've made, in one place."
          forgotPasswordHref="#forgot-password"
          signUpHref="#sign-up"
          providers={[
            {
              id: "passkey",
              label: "Continue with a passkey",
              icon: KeyRound,
              onSelect: () => {
                setNote("Touch your security key or use your fingerprint.");
              },
            },
            {
              id: "email-link",
              label: "Email me a sign-in link",
              icon: Mail,
              onSelect: () => {
                setNote("We emailed you a link that signs you in.");
              },
            },
          ]}
          onSubmit={async ({ email, password }) => {
            if (await signIn(email, password)) {
              setNote(`Signed in as ${email}.`);
              return undefined;
            }
            return "That email and password don't match. Try sam@example.com with a password of 8 characters or more.";
          }}
        />
      </Surface>
      {note === "" ? null : (
        <Text variant="body" tone="secondary">
          {note}
        </Text>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Email me a sign-in link");
  await see("We emailed you a link that signs you in.");
  await press("button", "Continue with a passkey");
  await see("Touch your security key or use your fingerprint.");
};
