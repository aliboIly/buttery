import type { ReactElement } from "react";
import { SignUpForm, defaultPasswordRules } from "@buttery/react";

/** A sign-up form that adds a rule to buttery's password rules. */
export function StricterPassword(): ReactElement {
  return (
    <SignUpForm
      passwordRules={[
        ...defaultPasswordRules,
        {
          label: "A capital letter",
          test: (password) => /[A-Z]/.test(password),
        },
      ]}
      onSubmit={() => undefined}
    />
  );
}
