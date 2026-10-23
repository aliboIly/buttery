import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Sidebar",
  kind: "pattern",
  purpose:
    "An app's navigation down the side: a workspace switcher, items, titled sections, groups that fold, and the pages visited lately.",
  useWhen: [
    'A dashboard\'s navigation, in an AppShell layout="sidebar"',
    "An app with more pages than a top bar holds, grouped into sections",
  ],
  avoidWhen: [
    "A marketing site's menus: use NavBar",
    "Sections of one long page: use SubNav",
  ],
  related: ["AppShell", "TopBar", "AccountMenu", "AppPage"],
  a11y: "A navigation named Main (or its label). Items are links with aria-current=\"page\" on the page shown; sections are groups named by their headings; a group's header is a button with aria-expanded and aria-controls. In a rail each item keeps its name (a visually hidden label) and shows it as a tooltip, and a group's header opens a menu of links.",
  motion: "morph",
  keyboard: [
    {
      keys: "Enter",
      does: "Follows the focused item's link, through onNavigate when it's given",
    },
    { keys: "Enter or Space", does: "Opens or closes the focused group" },
    {
      keys: "Enter, Space or Down",
      does: "Opens a group's flyout menu in a rail, where Up and Down move, Enter follows a link and Escape closes",
    },
  ],
  layout:
    "It fills its parent's height: the switcher stays at the top while the nav scrolls under it, 12px in from the sides, items 2px apart. Each item is a --bt-h-sm (28px) row whose whole width is its hit area, its label truncating and shown in full on hover. In an AppShell it's 240px wide, a 56px icon rail under 1100px of shell and a sheet under 640.",
  reducedMotion:
    "A group opens and closes at once, its chevron turning without animating.",
};
