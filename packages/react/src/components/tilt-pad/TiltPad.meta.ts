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
  keyboard: [
    {
      keys: "Tab",
      does: "Moves to the pad, one stop on the axis last moved, and on out of it",
    },
    {
      keys: "Arrow Left or Arrow Right",
      does: "Tilts it left or right by step, 0.1 by default",
    },
    {
      keys: "Arrow Up or Arrow Down",
      does: "Tilts it up or down by step",
    },
    { keys: "Shift and an arrow", does: "Tilts it five steps at once" },
    {
      keys: "Page Up or Page Down",
      does: "Tilts it five steps right or left, or up or down, along the axis last moved",
    },
    { keys: "Backspace, Delete or Home", does: "Sets it level" },
  ],
  layout:
    "A 32px circle that keeps its size wherever it sits, its 24px knob travelling 4px each way inside it. The whole circle is the hit area for a drag, and it shows no text.",
  reducedMotion:
    "The knob jumps to a new tilt at once instead of gliding there; a drag follows the pointer as it always does.",
};
