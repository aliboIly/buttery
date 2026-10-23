import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SegmentedControl",
  kind: "component",
  purpose:
    "One choice out of a few, shown side by side in a track, with the selection sliding between them.",
  useWhen: [
    "Two to five options that are all worth seeing at once: Gradient or Solid, Fit or Fill",
    "Switching a view where one option is always on",
    'A control that should span its column, as in a form card, with layout="fill"; a toolbar or a dense panel with size="sm"; a row of 48px fields or buttons with size="lg"',
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
    'A pill track 34px tall (`--bt-h-control`, 30 compact) at size="md", 28px (`--bt-h-sm`) at "sm" or 48px (`--bt-h-cta`, 40 compact) at "lg", padded 2px (4px at "lg") around segments that share one width, the widest label\'s. With layout="hug", the default, it\'s as wide as that makes it wherever it\'s placed, a Stack or a grid cell that stretches its children included; with layout="fill" it spans the width it\'s given, its segments sharing it equally, and in an Inline it takes the room its siblings leave. It\'s never wider than its container, where a label that doesn\'t fit truncates with an ellipsis and shows in full as its title. Each segment\'s full height is its hit area.',
  reducedMotion:
    "The selection appears on the chosen segment at once instead of sliding.",
};
