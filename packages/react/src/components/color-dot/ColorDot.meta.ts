import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens the picker, with focus on its saturation slider",
    },
    {
      keys: "Escape",
      does: "Closes the picker and puts focus back on the dot; in the code field, the first Escape puts back an unsaved code",
    },
  ],
  layout:
    "A 24px round dot that keeps its size in any row, with a 28px circle around it taking the press. The picker opens in a popover 8px beside it, with 12px of padding around the ColorPicker.",
  reducedMotion:
    "Its popover fades in and out over 100ms without growing, and the picker's thumbs land at once when a code or preset changes the color.",
};
