import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "TextField",
  kind: "component",
  purpose:
    "A labelled box for a line of text, with a hint, an error and optional icons.",
  useWhen: [
    "A name, an email address, a search, a title: any single line of text",
    "Sign-in and sign-up forms, at size lg",
    'A field on a card or in a toolbar, with variant="soft"; a dense panel or a toolbar, with size="sm"',
  ],
  avoidWhen: [
    "A password: use PasswordField",
    "Text that can run to several lines: use TextArea",
    "An exact number with steps: use NumberField",
  ],
  related: ["PasswordField", "TextArea", "Field", "NumberField"],
  a11y: "The visible label names the input and the hint and error describe it, with aria-invalid while there's an error; a new error is read out with the field's name as it appears (`announceError={false}` where an error summary reads it). The box has a 3:1 edge. Pass type, autoComplete and inputMode so browsers and password managers can fill it in and phones show the right keyboard. The whole box takes a press, and the focus ring shows on it.",
  motion: "none",
  keyboard: [
    { keys: "Letters, numbers and symbols", does: "Types them in" },
    { keys: "Enter", does: "Submits the form it's in, as any text input does" },
  ],
  layout:
    'It fills its container\'s width. The box is --bt-h-control (34px, 30 compact) tall, --bt-h-sm (28px) at size="sm", or --bt-h-cta (48px, 40 compact) with 16px text at size="lg", and the whole box is the hit area, its icons included; an outline box draws a 1px edge, and a soft one keeps that edge transparent until hover or focus, so the box never moves; text longer than the box scrolls inside the input. The label, the hint and the error sit above and below the box and wrap.',
};
