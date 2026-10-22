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
  keyboard: [],
  layout:
    "It's as wide as its parent and as tall as its children and the gaps between them. Children stretch across the column unless align says otherwise, and each can shrink below its content's width, so long text wraps or truncates instead of widening the column. It has no hit area of its own.",
};
