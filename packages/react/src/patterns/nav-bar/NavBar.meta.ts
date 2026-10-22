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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens or closes the focused trigger's menu, or on a narrow page opens the sheet from Menu",
    },
    {
      keys: "Arrow keys",
      does: "Move between the triggers and links in the bar, or between the sections in the sheet",
    },
    { keys: "Down arrow", does: "Moves from a trigger into its open menu" },
    {
      keys: "Escape",
      does: "Closes the open menu, or the sheet, and puts focus back on its trigger or on Menu",
    },
    {
      keys: "Tab",
      does: "Goes from an open trigger into its menu and on along the bar; in the sheet it stays inside until the sheet closes",
    },
  ],
  layout:
    "It's 64px tall (--bt-h-nav-bar) across its container, with its content on the page container, 1200px at most, unless contained is false: the brand at the start, the menus beside it and the actions at the end, never wrapping. Under 640px of its own width, or once the menus and actions no longer fit beside the brand, they fold into a Menu button that opens a full-height sheet 8px inside the window; a menu opens in one card 8px under the bar, never over it, and scrolls inside when it's taller than the room below.",
  reducedMotion:
    "Its menus fade in and out in 100ms and take each menu's size and place at once, as MorphMenu's do, the page behind blurs in 100ms, the sheet fades in without rising, and auto-hide shows and hides the bar at once.",
};
