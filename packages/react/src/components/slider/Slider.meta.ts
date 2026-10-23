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
  a11y: "Radix's slider: the thumb is role=slider, named by the label, with the formatted value as aria-valuetext. Arrow keys step, Shift and an arrow or Page Up and Page Down step ten, Home and End go to the ends, and Backspace or Delete resets, like a double-click on the label or badge. A press on the thumb focuses it and keeps the value; a press on the track moves the value there and focuses the thumb. Dragging updates the value every frame with no easing.",
  motion: "none",
  keyboard: [
    { keys: "Arrow Right or Arrow Up", does: "Moves the value up one step" },
    { keys: "Arrow Left or Arrow Down", does: "Moves the value down one step" },
    {
      keys: "Shift and an arrow, Page Up or Page Down",
      does: "Moves the value ten steps",
    },
    { keys: "Home or End", does: "Moves the value to min or max" },
    {
      keys: "Backspace or Delete",
      does: "Resets to resetValue, else defaultValue, else min",
    },
  ],
  layout:
    "It fills its container's width: the label and its value badge at the start, the label truncating with an ellipsis and showing in full as its title, and the track at --bt-w-row-control (160px) at the end. Its height is its 24px thumb's, and the thumb's hit area is 36px square; the badge keeps room for the formatted min and max, so it never changes width.",
};
