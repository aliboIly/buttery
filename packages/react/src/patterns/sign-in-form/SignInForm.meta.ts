import type { ComponentMeta } from "@butteryui/core";

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
  a11y: "A named form with a real heading. Fields fill in from the password manager (username on the email field, current-password). On a failed submit, each field shows what to fix and a summary with a link to each one appears and takes focus (role alert); a message returned from onSubmit shows there too. The submit button keeps its width while busy. Other ways to sign in are buttons named by their text.",
  motion: "none",
  keyboard: [
    {
      keys: "Enter",
      does: "Submits the form from the email or password field",
    },
  ],
  layout:
    'It fills its parent\'s width up to 400px, its parts 20px apart in a column: fields --bt-h-cta (48px) tall, a full-width submit button as tall that keeps its width while busy, and the other ways in as full-width buttons under an "or" rule. Errors wrap under their fields, and the forgot-password link has a 24px target.',
};
