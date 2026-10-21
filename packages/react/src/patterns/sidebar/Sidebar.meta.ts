import type { ComponentMeta } from "@buttery/core";

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
};
