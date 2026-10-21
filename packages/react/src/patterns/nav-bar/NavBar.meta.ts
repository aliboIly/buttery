import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "NavBar",
  kind: "pattern",
  purpose:
    "The bar across the top of a page: the brand, menus that open in one morphing panel, and the calls to action, static, sticky or auto-hiding.",
  useWhen: [
    "The top of a marketing, docs or help site",
    "A page whose sections need menus of links",
  ],
  avoidWhen: [
    "App screens: use HeaderBar in an AppShell",
    "Links to the sections of one page: use SubNav under the nav bar",
  ],
  related: ["MorphMenu", "SubNav", "Page", "Sticky"],
  a11y: 'A banner landmark holding a navigation named "Main". The menus work as MorphMenu\'s do. With little room, a "Menu" button opens a modal sheet with the same menus as sections, and Escape closes it.',
  motion: "morph",
};
