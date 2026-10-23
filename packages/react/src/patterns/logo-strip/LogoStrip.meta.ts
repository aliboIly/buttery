import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "LogoStrip",
  kind: "pattern",
  purpose:
    "A row of partner or customer marks in equal cells, each fitted into a 120 by 24 box and drawn in one quiet color.",
  useWhen: ["Showing who uses a product, under a hero or near pricing"],
  avoidWhen: [
    "Clickable partner links in a list: use a Grid of links",
    "Marks you don't have permission to show",
  ],
  related: ["Section", "StatStrip", "Grid"],
  a11y: "A list named by label; each mark names itself (alt on an image, aria-label on an svg).",
  motion: "none",
  keyboard: [],
  layout:
    "It takes its container's width as a grid of equal cells at least 120px wide, as many to a row as fit and 24px apart, wrapping onto more rows as it narrows. Each mark is fitted into a 120 by 24 box and drawn in text-tertiary, pictures in grayscale, and nothing in it takes presses.",
};
