import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SwatchGrid",
  kind: "component",
  purpose:
    "A grid of color and gradient swatches to pick one from, like radio buttons.",
  useWhen: [
    "Picking a background or fill from presets, such as the palettes in @buttery/core/palettes",
  ],
  avoidWhen: [
    "Any color at all: use ColorDot",
    "A few named options: use SegmentedControl",
  ],
  related: ["ColorDot", "SegmentedControl", "Morph"],
  a11y: "A radiogroup named by label; each swatch is a radio named by its label, and the chosen one is checked. It's one tab stop, on the chosen swatch. Arrow keys move across rows and up and down columns, choosing as they go; Home and End reach the first and last.",
  motion: "none",
};
