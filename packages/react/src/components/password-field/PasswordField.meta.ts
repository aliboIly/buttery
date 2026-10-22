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
  keyboard: [
    {
      keys: "Tab",
      does: "Moves from the password box to the button that shows the password",
    },
    {
      keys: "Enter or Space",
      does: "Shows or hides the password, from that button",
    },
    {
      keys: "Enter",
      does: "Sends its form from the password box, and a shown password hides again",
    },
  ],
  layout:
    'It fills its container. Its box is 34px tall (--bt-h-control) at size="md", the default, and 48px (--bt-h-cta) with 16px text at "lg", with the 28px reveal button inside its end. The label, hint, error and requirements stack 8px apart and wrap, each rule 6px from the next.',
};
