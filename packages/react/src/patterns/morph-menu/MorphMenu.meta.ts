import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "MorphMenu",
  kind: "pattern",
  purpose:
    "A row of menu triggers whose menus open in one floating panel that reshapes from menu to menu instead of closing and reopening.",
  useWhen: [
    "Top-level navigation with a few menus of links, each with a caption",
    "Menus that should feel like one surface as the pointer moves along the row",
  ],
  avoidWhen: [
    "A page's top bar: use NavBar, which holds a MorphMenu",
    "Actions on a thing: use Menu",
  ],
  related: ["NavBar", "Menu", "SubNav"],
  a11y: 'A navigation landmark ("Main" by default). Triggers are buttons with `aria-expanded`; the arrow keys move between them, Enter, Space or ArrowDown opens a menu and ArrowDown moves into an open one, and Escape closes it with focus back on its trigger. The pointer never closes or switches a menu that keyboard focus is in. Each column is a list named by its heading. In a stack, each menu is an accordion section.',
  motion: "morph",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens or closes the focused trigger's menu, or in a stack its section",
    },
    {
      keys: "Arrow keys",
      does: "Move between the triggers and links in the row, without wrapping, or between the sections in a stack",
    },
    {
      keys: "Down arrow",
      does: "Opens the focused trigger's menu, or moves into it once it's open",
    },
    { keys: "Home or End", does: "Moves to the first or last item in the row" },
    {
      keys: "Escape",
      does: "Closes the open menu and puts focus back on its trigger",
    },
    {
      keys: "Tab",
      does: "Goes from an open trigger into its menu, then past the menu's last link to the next trigger, or after the last menu to what follows the row",
    },
  ],
  layout:
    "In a row, each trigger is a 36px pill (--bt-h-button) whose press area runs the row's full height, and a row too narrow for its triggers scrolls sideways; a menu opens in one floating card 8px under the row, the menu's size, centered under its trigger and kept inside the row, and scrolls inside when the window has less room below. In a stack each section's trigger is 48px tall and full width, and entry captions truncate to one line.",
  reducedMotion:
    "The card appears and leaves with a 100ms fade, a switch swaps the columns without sliding while the card takes its new size and place at once, and the chevron turns at once.",
};
