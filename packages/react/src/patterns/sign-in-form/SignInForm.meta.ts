import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SignInForm",
  kind: "pattern",
  purpose:
    "A sign-in form: email, password, keep me signed in, other ways to sign in, and errors summed up where they can be fixed.",
  useWhen: [
    "A sign-in page or dialog: pass onSubmit and, if you have them, the forgot-password and sign-up links",
  ],
  avoidWhen: [
    "Creating an account: use SignUpForm",
    'A one-time code step: use TextField with autoComplete="one-time-code"',
  ],
  related: ["SignUpForm", "TextField", "PasswordField", "Checkbox", "Callout"],
  a11y: "A named form with a real heading. Fields fill in from the password manager (email, current-password). On a failed submit, each field shows what to fix and a summary with a link to each one appears and takes focus (role alert); a message returned from onSubmit shows there too. The submit button keeps its width while busy. Other ways to sign in are buttons named by their text.",
  motion: "none",
};
