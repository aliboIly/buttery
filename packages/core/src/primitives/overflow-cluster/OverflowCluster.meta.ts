import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "OverflowCluster",
  kind: "primitive",
  purpose:
    'A row of actions that moves its lowest-priority items into a "More" menu instead of wrapping, overlapping or shrinking.',
  useWhen: [
    "Toolbars, header actions and nav bars that have to fit from 390px phones to wide desktops",
  ],
  avoidWhen: [
    "Rows that may wrap, such as tags or chips: use Inline wrap",
    "Content that should scroll horizontally: use a scroll container",
  ],
  related: ["Inline", "Popover", "Divider"],
  a11y: "Hidden items leave the tab order and the accessibility tree; their actions stay reachable through the More button, a menu button with arrow-key navigation, Enter to choose and Escape to close. Items that say whether they're chosen are listed as radio items, the others as menu items with their icons, shortcuts and dots; the More button shows a dot, and says so in its name, while a folded item has one.",
  motion: "none",
};
