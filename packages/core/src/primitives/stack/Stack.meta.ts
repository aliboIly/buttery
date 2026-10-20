import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Stack",
  kind: "primitive",
  purpose: "Lays children out in a column with a gap from the spacing scale.",
  useWhen: [
    "Stacking text, fields or sections vertically",
    "Any vertical group whose spacing should come from the scale",
  ],
  avoidWhen: [
    "Equal-width rows of buttons: use Inline uniform",
    "Two-dimensional layouts: use Grid",
  ],
  related: ["Inline", "Grid", "Center"],
  a11y: "No role of its own; renders a div (or its child with asChild), so it adds nothing to the accessibility tree.",
  motion: "none",
};
