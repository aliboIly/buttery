import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ColorDot",
  kind: "component",
  purpose:
    "A small round swatch that opens the system color picker to choose a color.",
  useWhen: [
    "Choosing any color, such as a gradient's two stops or a solid fill",
  ],
  avoidWhen: ["Picking from presets: use SwatchGrid"],
  related: ["SwatchGrid", "IconButton"],
  a11y: "A native color input, visually hidden and named by label; the dot shows the color and the 28px circle around it takes the press. Keyboard focus rings the dot, and Space or Enter opens the picker.",
  motion: "none",
};
