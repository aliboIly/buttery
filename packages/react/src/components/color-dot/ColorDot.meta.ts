import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ColorDot",
  kind: "component",
  purpose:
    "A small round swatch that opens buttery's color picker in a popover to choose any color.",
  useWhen: [
    "Choosing any color in a row of controls, such as a gradient's two stops or a solid fill",
  ],
  avoidWhen: [
    "Picking from presets: use SwatchGrid",
    "A picker that stays open: use ColorPicker",
  ],
  related: ["ColorPicker", "SwatchGrid", "IconButton"],
  a11y: 'A button named by its label and color ("First hue, #a5b4fc"); the 28px circle around the dot takes the press. Enter, Space or a press opens a popover named by the label holding a ColorPicker, with focus on its saturation slider; Escape or a press outside closes it and focus goes back to the dot. In the code field, the first Escape puts back an unsaved code and the second closes.',
  motion: "presence",
};
