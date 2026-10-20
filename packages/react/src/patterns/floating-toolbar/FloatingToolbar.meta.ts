import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "FloatingToolbar",
  kind: "pattern",
  purpose:
    "A floating pill of actions anchored under an element, such as crop mode's size, Reset, Cancel and Apply.",
  useWhen: [
    "Actions for a mode that works on one element: crop, trim, a selection",
  ],
  avoidWhen: [
    "Actions that are always there: put them in the HeaderBar or an inspector",
    "A message: use toast()",
  ],
  related: ["Stage", "HeaderBar", "FloatingLanes"],
  a11y: "A toolbar named by label: one Tab stop, with the arrow keys moving between its buttons. Toasts and notices move out of its way instead of covering it.",
  motion: "presence",
};
