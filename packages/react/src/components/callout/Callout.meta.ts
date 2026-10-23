import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Callout",
  kind: "component",
  purpose:
    "A tinted box for a message in place: information, success, a warning or an error.",
  useWhen: [
    "A form's error summary after a failed submit (role alert)",
    "A note that belongs with the content around it, such as where a price you change shows up",
  ],
  avoidWhen: [
    "Confirming an action that changed something out of view: use toast()",
    "An error on one field: pass it to the field's error",
  ],
  related: ["Toaster", "Field", "SignInForm"],
  a11y: 'No role of its own: give an error that appears after an action role="alert" and a result role="status", so they\'re read out; a callout there from the start needs neither. The icon marks the tone along with the tint, and every tone\'s text passes AA on its tint.',
  motion: "none",
  keyboard: [],
  layout:
    "It fills the width it's given, with 12px of padding above and below and 16px at the sides; its text wraps, and the icon stays centered on the first line. It takes no presses itself: links and buttons in its body or action bring their own hit areas, a link on a line of its own reaching 24px.",
};
