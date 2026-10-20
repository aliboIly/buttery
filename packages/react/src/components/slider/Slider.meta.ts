import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Slider",
  kind: "component",
  purpose:
    "A labeled slider row: the label and its value badge beside a track you drag, click or step with the keyboard.",
  useWhen: [
    "A continuous value you judge by eye: rotation, scale, blur, opacity",
    "Inspector rows, where the live value shows in the badge",
  ],
  avoidWhen: [
    "An exact number people type: use NumberField",
    "A few named levels: use SegmentedControl",
  ],
  related: ["ValueBadge", "NumberField", "Chip"],
  a11y: "Radix's slider: the thumb is role=slider, named by the label, with the formatted value as aria-valuetext. Arrow keys step, Shift and an arrow or Page Up and Page Down step ten, Home and End go to the ends, and Backspace or Delete resets, like a double-click on the label or badge. Dragging updates the value every frame with no easing.",
  motion: "none",
};
