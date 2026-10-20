import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "NumberField",
  kind: "component",
  purpose:
    "A small field for an exact number, with arrow-key steps, a stepper on hover and scrubbing by dragging its label.",
  useWhen: [
    "Exact sizes and positions: width, height, x, y, a crop in pixels",
    "Pairs of numbers in an inspector or a menu footer",
  ],
  avoidWhen: [
    "A value judged by eye: use Slider",
    "Free text or long numbers such as phone numbers: use a text input",
  ],
  related: ["Slider", "ValueBadge"],
  a11y: "A spinbutton named by its label: arrow keys step, Shift and an arrow steps ten, Enter or leaving commits what was typed, Escape puts back the last value. The stepper buttons skip the tab order, since the arrow keys do the same.",
  motion: "none",
};
