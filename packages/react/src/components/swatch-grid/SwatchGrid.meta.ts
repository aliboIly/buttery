import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SwatchGrid",
  kind: "component",
  purpose:
    "A grid of color and gradient swatches to pick one from, like radio buttons.",
  useWhen: [
    "Picking a background or fill from presets, such as the palettes in @butteryui/core/palettes",
  ],
  avoidWhen: [
    "Any color at all: use ColorDot",
    "A few named options: use SegmentedControl",
  ],
  related: ["ColorDot", "SegmentedControl", "Morph"],
  a11y: "A radiogroup named by label; each swatch is a radio named by its label, and the chosen one is checked. It's one tab stop, on the chosen swatch. Arrow keys move across rows and up and down columns, choosing as they go; Home and End reach the first and last.",
  motion: "none",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves into the grid on the chosen swatch, or the first when none is, and on out of it",
    },
    {
      keys: "Arrow Right or Arrow Left",
      does: "Chooses the next or previous swatch, wrapping from the last to the first and back",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Chooses the swatch below or above, staying put on the last or first row",
    },
    { keys: "Home or End", does: "Chooses the first or last swatch" },
    { keys: "Space or Enter", does: "Chooses the focused swatch" },
  ],
  layout:
    "It fills its container's width with columns square swatches to a row (6 by default), 8px apart, and wraps the rest onto more rows; each swatch is a square share of the width and the whole square is its hit area. It shows no text: each swatch's name is its title.",
};
