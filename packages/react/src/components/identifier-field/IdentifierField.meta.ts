import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "IdentifierField",
  kind: "component",
  purpose:
    "One field for an email address or a phone number, which tells them apart as they're typed and formats a phone number as it goes.",
  useWhen: [
    "The first step of a passwordless sign-in or sign-up, as AuthFlow draws it",
    "Anywhere either an email address or a phone number will do, such as where to send a receipt",
  ],
  avoidWhen: [
    "Only an email address: use TextField with type email",
    "A whole sign-in screen: use AuthFlow",
  ],
  related: ["AuthFlow", "OneTimeCodeField", "TextField"],
  a11y: "A labelled text input (\"Email or phone number\" by default). It asks for the keyboard and the autofill that match what's typed: email, tel, or username until it can tell, and \"username webauthn\" with passkey to offer saved passkeys. It says nothing while it's typed in; once it's left with something that can't be used, the error describes it and is read out with the field's name.",
  motion: "none",
  keyboard: [
    {
      keys: "Letters, numbers and symbols",
      does: "Type them in, a phone number formatted as it goes",
    },
    { keys: "Enter", does: "Submits the form it's in" },
  ],
  layout:
    "It fills its container's width at --bt-h-cta (48px) with 16px text, so phones don't zoom in. The error sits under the box and wraps.",
};
