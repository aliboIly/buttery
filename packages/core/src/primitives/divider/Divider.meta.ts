import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Divider",
  kind: "primitive",
  purpose: "A 1px line in the border color between groups of content.",
  useWhen: [
    "Separating groups in a menu, toolbar or header",
    "Between rows that aren't already divided by their card",
  ],
  avoidWhen: [
    "Spacing groups apart: use the parent's gap",
    "Rows inside an inspector card: the card draws their dividers",
  ],
  related: ["Stack", "Inline"],
  a11y: 'Announced as a separator with its orientation; decorative dividers use role="none" and are skipped.',
  motion: "none",
  keyboard: [],
  layout:
    "A horizontal divider runs across its column's full width; a vertical one runs its row's full height, or the length you give it on the spacing scale, centered, such as `length={6}` for 24px. Either way it takes up only its 1px line, never growing or shrinking with the space around it, and it has no hit area.",
};
