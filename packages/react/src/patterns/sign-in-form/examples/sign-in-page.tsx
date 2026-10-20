import type { ReactElement } from "react";
import { SignInForm } from "@buttery/react";

/** A sign-in page's form, handing its values to your own sign-in call. */
export function SignInPage({
  signIn,
}: {
  readonly signIn: (email: string, password: string) => Promise<boolean>;
}): ReactElement {
  return (
    <SignInForm
      description="Welcome back to Card Studio."
      forgotPasswordHref="/forgot-password"
      signUpHref="/sign-up"
      onSubmit={async ({ email, password }) =>
        (await signIn(email, password))
          ? undefined
          : "That email and password don't match."
      }
    />
  );
}
