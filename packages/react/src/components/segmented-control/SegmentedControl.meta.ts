import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SegmentedControl",
  kind: "component",
  purpose:
    "One choice out of a few, shown side by side in a track, with the selection sliding between them.",
  useWhen: [
    "Two to five options that are all worth seeing at once: Gradient or Solid, Fit or Fill",
    "Switching a view where one option is always on",
  ],
  avoidWhen: [
    "More than five options or long labels: use Select",
    "Options that can all be off, or several on: use toggle buttons",
    "Navigation between pages: use tabs or links",
  ],
  related: ["SharedIndicator", "Button"],
  a11y: "A radio group named by label: Tab reaches the chosen segment, arrow keys move the choice and pick as they go, and one segment is always chosen.",
  motion: "indicator",
  keyboard: [
    {
      keys: "Tab",
      does: "Reaches the chosen segment, the control's one Tab stop",
    },
    {
      keys: "Left or Right arrow",
      does: "Moves the choice to the segment before or after, going round at the ends and skipping disabled ones",
    },
    {
      keys: "Home or End",
      does: "Moves focus to the first or last segment, which Space then chooses",
    },
    { keys: "Space", does: "Chooses the segment with focus" },
  ],
  layout:
    "A pill track 34px tall (--bt-h-control), padded 2px around segments that share one width, the widest label's. It's as wide as that makes it and never wider than its container, where a label that doesn't fit truncates with an ellipsis and shows in full as its title. Each segment's full 30px height is its hit area.",
  reducedMotion:
    "The selection appears on the chosen segment at once instead of sliding.",
};
