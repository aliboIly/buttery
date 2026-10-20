import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Text",
  kind: "primitive",
  purpose:
    "Text in one of buttery's type roles, with size, line height, weight, tracking and color from the tokens.",
  useWhen: [
    "Every piece of UI text: labels, titles, body copy, captions, display headings",
  ],
  avoidWhen: [
    "Raw font sizes or colors in CSS: pick the role that fits instead",
  ],
  related: ["Stack", "Icon"],
  a11y: "Renders a p or span; use asChild to render a heading (h1–h6) so the document outline stays correct. Truncated text keeps the full text in its title.",
  motion: "none",
};
