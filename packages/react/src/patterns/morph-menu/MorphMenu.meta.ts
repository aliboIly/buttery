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
  a11y: 'A navigation landmark ("Main" by default). Triggers are buttons with `aria-expanded`; the arrow keys move between them, Enter, Space or ArrowDown opens a menu, and Escape closes it with focus back on its trigger. Each column is a list named by its heading. In a stack, each menu is an accordion section.',
  motion: "morph",
};
