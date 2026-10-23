import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "AuthFlow",
  kind: "pattern",
  purpose:
    "A passwordless sign-in or sign-up with a one-time code: an email or phone number, then the code, on one surface.",
  useWhen: [
    "Signing in and signing up with a code sent by email or text, with no password",
    "A sign-in screen of its own, or the sign-in step of a demo or a checkout",
  ],
  avoidWhen: [
    "Signing in with an email and a password: use SignInForm",
    "Asking for a code somewhere other than signing in: use OneTimeCodeField",
    "Your own layout of the steps: use useOtpFlow with IdentifierField and OneTimeCodeField",
  ],
  related: ["IdentifierField", "OneTimeCodeField", "SignInForm", "SignUpForm"],
  a11y: "Each step is a form with a heading. The first step's button says it can't act yet (aria-disabled) until the field holds an email address or a phone number, and pressing it then says why in the field's error. The code field takes focus the moment its step appears, and the first step's field when going back, which Escape does from the code step. Checking, success and errors are read out from the code field. It never says whether an account exists.",
  motion: "morph",
  reducedMotion:
    "The steps swap at once, with no slide, and the height jumps; the code field's colors still change.",
  keyboard: [
    {
      keys: "Enter",
      does: "Sends the code from the first step, or checks a full code",
    },
    {
      keys: "Escape",
      does: "Goes back from the code step, the email or phone still filled in",
    },
    { keys: "Tab", does: "Moves between the field, the button and the links" },
  ],
  layout:
    "A column at most --bt-w-auth (360px) wide, centered, with room above it that shrinks in a short window, so with a phone's keyboard up the field and the button stay above it. The height follows the step through Morph, and the line under the code field and the resend line keep their height in every state.",
};
