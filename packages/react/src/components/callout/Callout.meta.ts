import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Callout",
  kind: "component",
  purpose:
    "A tinted box for a message in place: information, success, a warning or an error.",
  useWhen: [
    "A form's error summary after a failed submit (role alert)",
    "A note that belongs with the content around it, such as what happens to a card you share",
  ],
  avoidWhen: [
    "Confirming an action that changed something out of view: use toast()",
    "An error on one field: pass it to the field's error",
  ],
  related: ["Toaster", "Field", "SignInForm"],
  a11y: 'No role of its own: give an error that appears after an action role="alert" and a result role="status", so they\'re read out; a callout there from the start needs neither. The icon marks the tone along with the tint, and every tone\'s text passes AA on its tint.',
  motion: "none",
};
