import type { ReactElement } from "react";
import { SignUpForm } from "@buttery/react";
import type { SignUpValues } from "@buttery/react";

/** A sign-up page's form with the terms, handing its values to your own call. */
export function SignUpPage({
  createAccount,
}: {
  readonly createAccount: (values: SignUpValues) => Promise<string | undefined>;
}): ReactElement {
  return (
    <SignUpForm
      description="Make cards and keep them in one place."
      termsHref="/terms"
      signInHref="/sign-in"
      onSubmit={createAccount}
    />
  );
}
