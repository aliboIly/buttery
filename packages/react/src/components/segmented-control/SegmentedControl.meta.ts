import type { ComponentMeta } from "@buttery/core";

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
};
