import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SplitButton",
  kind: "component",
  purpose:
    "A primary action with a menu of related ones beside it: two halves of one pill, each its own button.",
  useWhen: [
    "One main action with a few close alternatives: Export, with Export as JPG and Copy to clipboard",
    "The footer of an inspector or a dialog where the main action has variants",
  ],
  avoidWhen: [
    "Actions that are equally likely: show them as separate buttons",
    "More than six alternatives, or settings: use a menu or a dialog",
  ],
  related: ["Button", "Menu"],
  a11y: "A group of two buttons, each a tab stop: the main half is named by its label, the chevron half by menuLabel. The chevron opens a menu: arrow keys move, Enter chooses, Escape closes and returns focus.",
  motion: "press",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves between the main half and the chevron half, each its own stop",
    },
    {
      keys: "Enter or Space",
      does: "Runs the main action on the main half, or the focused entry in the menu, which then closes",
    },
    {
      keys: "Enter, Space or Arrow Down",
      does: "Opens the menu from the chevron half, with focus on its first entry",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Moves between the menu's entries, skipping disabled ones",
    },
    { keys: "Home or End", does: "Moves to the first or last entry" },
    { keys: "Letters", does: "Jumps to the entry that starts with them" },
    {
      keys: "Escape",
      does: "Closes the menu and puts focus back on the chevron half",
    },
  ],
  layout:
    "One pill --bt-h-button (36px) tall: the main half as wide as its label and padding, then a 1px divider half the pill's height, then the chevron half, a 36px square. It's never wider than its container, where a long label truncates with an ellipsis and shows in full as its title. Each half is a hit area the pill's full height, and the menu is at least --bt-w-menu-min (200px) wide.",
  reducedMotion:
    "Each half presses in at once, and the menu fades in and out over 100ms without growing.",
};
