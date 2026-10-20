import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "PasswordField",
  kind: "component",
  purpose:
    "A labelled password box with a button that shows or hides what's typed, and optional requirements.",
  useWhen: [
    "Signing in, with the saved password filled in (the default)",
    'Choosing a password, with autoComplete="new-password" and the rules it has to meet',
  ],
  avoidWhen: [
    'Codes sent by email or text: use TextField with autoComplete="one-time-code"',
  ],
  related: ["TextField", "SignInForm", "SignUpForm"],
  a11y: 'The reveal button is a toggle with a fixed name ("Show password") and aria-pressed, in the tab order after the input. Requirements are a list that describes the input; each rule has a tick named "Met" or a circle named "Not met", so its state doesn\'t rest on color. A shown password is never corrected, capitalized or spell-checked, and hides again when its form is submitted.',
  motion: "none",
};
