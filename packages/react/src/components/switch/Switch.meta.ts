import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Switch",
  kind: "component",
  purpose:
    "A switch that turns a setting on or off at once, with its label beside it.",
  useWhen: [
    "A setting that takes effect as soon as it's flipped: snap to grid, dark previews, sync",
    'A dense list of settings, such as a table\'s notification options, with size="sm"',
  ],
  avoidWhen: [
    "A choice in a form that waits for Submit: use Checkbox",
    "One of several options: use SegmentedControl",
  ],
  related: ["Checkbox", "SegmentedControl"],
  a11y: "A real switch (role switch) named by its label, which takes presses too; Space and Enter flip it. The track has a 3:1 edge while off and a 24px target. The thumb slides on spring.snappy and jumps with reduced motion. In forced colors it draws itself in system colors.",
  motion: "indicator",
  keyboard: [{ keys: "Space or Enter", does: "Turns it on or off" }],
  layout:
    'The track is 32px wide and `--bt-h-badge` (20px, 18 compact) tall, with a hit area 24px tall, and its label sits 8px after it; at size="sm" the track is 26px wide and 4px under the badge height (16, 14 compact), its 13px label 6px after it, its hit area still 24px tall. A press on the label flips it too. The label and the hint wrap rather than truncate, and the hint lines up under the label.',
  reducedMotion: "The thumb lands at its new end at once instead of sliding.",
};
