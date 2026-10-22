import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SignUpForm",
  kind: "pattern",
  purpose:
    "A sign-up form: name, email, a new password with its rules, the terms, and errors summed up where they can be fixed.",
  useWhen: [
    "Creating an account: pass onSubmit, and the terms and sign-in links if you have them",
  ],
  avoidWhen: [
    "Signing in: use SignInForm",
    'Changing a password: use PasswordField with autoComplete="new-password" and its requirements',
  ],
  related: ["SignInForm", "PasswordField", "Checkbox", "Callout"],
  a11y: "A named form with a real heading. The email field is the username for password managers, and the password asks for a new password (new-password) and lists its rules, each ticked as it's met, as part of its description. On a failed submit, each field shows what to fix and a summary with a link to each one appears and takes focus (role alert).",
  motion: "none",
  keyboard: [
    {
      keys: "Enter",
      does: "Submits the form from the name, email or password field",
    },
  ],
  layout:
    "It fills its parent's width up to 400px, its parts 20px apart in a column: fields --bt-h-cta (48px) tall, the password's rules listed under it, the terms box, a full-width submit button as tall that keeps its width while busy, and the other ways in as full-width buttons under an \"or\" rule. Labels and errors wrap rather than truncate.",
};
