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
  keyboard: [],
  layout:
    "Block roles (the titles, body, caption and the display roles) are paragraphs trimmed to their text, with body text wrapping at 60 characters and display headings at 22; the other roles are inline spans. With truncate it keeps to one line and ends in an ellipsis, with its full text in its title. It has no hit area.",
};
