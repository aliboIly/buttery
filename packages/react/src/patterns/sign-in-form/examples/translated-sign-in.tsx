import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SignInForm } from "@butteryui/react";

/** A sign-in form in German, through its labels. */
export function TranslatedSignIn(): ReactElement {
  const [user, setUser] = useState<string | null>(null);
  return (
    <Stack gap={4}>
      <SignInForm
        labels={{
          title: "Anmelden",
          email: "E-Mail",
          password: "Passwort",
          showPassword: "Passwort anzeigen",
          remember: "Angemeldet bleiben",
          submit: "Anmelden",
          problem: "Bitte prüfen",
          emailMissing: "Gib deine E-Mail-Adresse ein",
          emailInvalid: "Gib eine E-Mail-Adresse wie name@beispiel.de ein",
          passwordMissing: "Gib dein Passwort ein",
        }}
        onSubmit={({ email }) => {
          setUser(email);
          return undefined;
        }}
      />
      {user === null ? null : (
        <Text variant="body">{`Angemeldet als ${user}.`}</Text>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Anmelden");
  await see("Gib deine E-Mail-Adresse ein");
  await type("E-Mail", "lena@beispiel.de");
  await type("Passwort", "röstzeit");
  await press("button", "Passwort anzeigen");
  await press("button", "Anmelden");
  await see("Angemeldet als lena@beispiel.de.");
};
