import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Icon",
  kind: "primitive",
  purpose:
    "An icon at buttery's sizes: 16px in controls, 20px in empty states, stroke 1.75.",
  useWhen: ["Icons inside buttons, rows and empty states"],
  avoidWhen: [
    "An icon as the only content of a button: use IconButton (Phase 4), which requires a label",
  ],
  related: ["Text", "Pressable"],
  a11y: "Hidden from screen readers unless it has a label, in which case it's an image with that name.",
  motion: "none",
  keyboard: [],
  layout:
    "A square of --bt-icon-sm (16px) or, at size md, --bt-icon-md (20px), stroked at 1.75, that never grows or shrinks in a row. It has no hit area of its own: a pressable icon takes its size and name from the button around it, as IconButton does.",
};
