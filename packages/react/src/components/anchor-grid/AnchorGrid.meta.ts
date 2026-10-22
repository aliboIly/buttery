import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "AnchorGrid",
  kind: "component",
  purpose:
    "A 3×3 grid of dots for picking where something sits: a corner, an edge or the center.",
  useWhen: [
    "Placing content inside a frame: a card on a canvas, a caption on an image",
  ],
  avoidWhen: ["Exact positions: use NumberFields for x and y"],
  related: ["TiltPad", "SegmentedControl", "SharedIndicator"],
  a11y: 'A radiogroup named by label with nine radios ("Top left" … "Bottom right"), one tab stop. Arrow keys move in two dimensions, choosing as they go, and stop at the edges; Home and End reach the corners. The whole box takes a press and picks the nearest dot, since each dot is too small to aim at (data-bt-target="group").',
  motion: "indicator",
  keyboard: [
    {
      keys: "Arrow keys",
      does: "Moves to the next dot in that direction and chooses it, stopping at the edges",
    },
    {
      keys: "Home or End",
      does: "Chooses the top left or the bottom right dot",
    },
  ],
  layout:
    "A fixed 43px square box with the nine dots 11.5px apart, which keeps its size in any row. The whole box is one hit area: a press anywhere in it picks the nearest dot.",
  reducedMotion:
    "The knob shows on the new dot at once instead of sliding there.",
};
