import type { ReactElement } from "react";
import { SignInForm } from "@buttery/react";

/** A sign-in form in German, through its labels. */
export function TranslatedSignIn(): ReactElement {
  return (
    <SignInForm
      labels={{
        title: "Anmelden",
        email: "E-Mail",
        password: "Passwort",
        remember: "Angemeldet bleiben",
        submit: "Anmelden",
        problem: "Bitte prüfen",
        emailMissing: "Gib deine E-Mail-Adresse ein",
        emailInvalid: "Gib eine E-Mail-Adresse wie name@beispiel.de ein",
        passwordMissing: "Gib dein Passwort ein",
      }}
      onSubmit={() => undefined}
    />
  );
}
