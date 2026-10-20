import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "TiltPad",
  kind: "component",
  purpose:
    "A small pad for tilting something in 3D: drag the knob or use the arrow keys.",
  useWhen: [
    "Tilting a card or an image in 3D, as x and y from −1 to 1 mapped to rotateY and rotateX",
  ],
  avoidWhen: [
    "Turning something flat: use a Slider in degrees",
    "Placing something: use AnchorGrid",
  ],
  related: ["AnchorGrid", "Chip", "Slider"],
  a11y: 'A group named by label holding two sliders, "Left and right" and "Up and down", each reading its value as words ("30% right"). Left and right arrows tilt sideways, up and down tilt up and down (focus moves to that slider so its value is read), Shift takes bigger steps, and Backspace, Delete or Home set it level. The pad shows the focus ring.',
  motion: "indicator",
};
