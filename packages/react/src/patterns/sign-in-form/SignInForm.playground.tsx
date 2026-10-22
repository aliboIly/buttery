import { KeyRound, Mail } from "lucide-react";
import { Surface } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { SignInForm, toast } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "SignInForm",
  description:
    "A sign-in form: email, password, keep me signed in, other ways to sign in, and errors summed up where they can be fixed.",
  order: 290,
  status: "stable",
  since: "0.5.0",
  home: "patterns/forms",
};

/** Waits a moment, as a server would, then lets sam@example.com in with any password over 7 characters. */
async function signIn({
  email,
  password,
}: {
  readonly email: string;
  readonly password: string;
}): Promise<string | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (email === "sam@example.com" && password.length > 7) {
    toast("Signed in");
    return undefined;
  }
  return "That email and password don't match. Try sam@example.com with a password of 8 characters or more.";
}

export const demos: readonly DemoSection[] = [
  {
    title: "Card Studio sign-in",
    description:
      "Submit it empty to see the summary and the field errors; sam@example.com with any 8-character password signs in.",
    render: () => (
      <Surface level="card" pad={6}>
        <SignInForm
          titleAs="h2"
          title="Sign in to Card Studio"
          description="Pick up where you left off."
          forgotPasswordHref="#/sign-in-form"
          signUpHref="#/sign-up-form"
          providers={[
            {
              id: "passkey",
              label: "Continue with a passkey",
              icon: KeyRound,
              onSelect: () => {
                toast("Passkeys aren't set up in this demo");
              },
            },
            {
              id: "email-link",
              label: "Email me a sign-in link",
              icon: Mail,
              onSelect: () => {
                toast("Check your inbox");
              },
            },
          ]}
          onSubmit={signIn}
        />
      </Surface>
    ),
  },
];
