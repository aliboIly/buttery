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
  motion: "presence",
  keyboard: [
    {
      keys: "Enter, Space or Down arrow",
      does: "Opens the More menu from its button, with focus on the first item",
    },
    { keys: "Up and Down arrows", does: "Moves between the menu's items" },
    { keys: "Home and End", does: "Moves to the first or the last item" },
    { keys: "A letter", does: "Moves to the next item that starts with it" },
    {
      keys: "Enter or Space",
      does: "Chooses the item in focus, which runs its onSelect, and closes the menu",
    },
    {
      keys: "Escape",
      does: "Closes the menu and puts focus back on the More button",
    },
  ],
  layout:
    "It fills the space its parent gives it and keeps its items on one row at their own size, never wrapping, overlapping or shrinking them: what doesn't fit moves into the More menu, lowest priority first, and comes back as the row grows. The More button is a circle as tall as its size, --bt-h-sm (28px), --bt-h-control (34px) or --bt-h-button (36px, the default), and that circle is its hit area.",
  reducedMotion:
    'The More button still shrinks to 97% while it\'s pressed, but at once instead of easing, and its menu fades in and out over 100ms without growing from the button; with entrance="instant" the menu shows and goes at once either way.',
};
