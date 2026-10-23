import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "OneTimeCodeField",
  kind: "component",
  purpose:
    "One input for a one-time code, drawn as a slot per digit, that takes a pasted or autofilled code whole.",
  useWhen: [
    "The code step of a passwordless sign-in or sign-up, as AuthFlow draws it",
    "Confirming an email address or a phone number with a code sent to it",
    "A short numeric code someone reads off another screen, such as a locker or pairing code",
  ],
  avoidWhen: [
    "A password or a code with letters: use PasswordField or TextField",
    "A whole sign-in screen: use AuthFlow, which brings the identifier step and the resend timer",
  ],
  related: ["AuthFlow", "IdentifierField", "TextField", "PasswordField"],
  a11y: 'It\'s one real input with a label ("One-time code" by default, kept for screen readers with `hideLabel`), numeric and marked `autocomplete="one-time-code"`, so the system\'s code from a message, a password manager and a paste all fill it at once. The slots are drawn for the eye and hidden from screen readers, which read the input\'s value. The note or status under the field describes the input, and checking, success and errors are read out as they happen. An error takes focus back to the field.',
  motion: "presence",
  reducedMotion:
    "The check appears at once and the caret holds still; the border and fill still change color.",
  keyboard: [
    {
      keys: "Digits",
      does: "Fill the next slot; anything else typed is left out",
    },
    { keys: "Backspace", does: "Clears the digit before the caret" },
    { keys: "Arrow left and right", does: "Move between slots" },
    { keys: "Enter", does: "Submits the form it's in" },
  ],
  layout:
    "It fills its container's width, its slots sharing it evenly. The box is --bt-h-cta (48px) tall, and the whole box takes presses and pastes. The line under it is kept in every state, so a status coming or going never moves what's below.",
};
