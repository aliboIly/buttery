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
};
