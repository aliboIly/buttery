import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "CatalogPage",
  kind: "pattern",
  purpose:
    "A page of things to browse: a filter column with search, categories and checkboxes beside a featured block on a tinted surface and grids of cards.",
  useWhen: [
    "Add-ons, integrations, templates or perks someone browses and picks from",
    "A catalog with categories and a few filters, each item leading to its own page",
  ],
  avoidWhen: [
    "Records someone works through, such as orders: use AppPage with a DataTable and a FilterBar",
    "A handful of links: use SettingsIndex",
  ],
  related: ["DetailPage", "TagChip", "SearchField", "Checkbox", "AppPage"],
  a11y: 'The page\'s main landmark, its title the h1. The filter column is a complementary landmark named by filtersLabel; the categories are a navigation named by their h2, the shown one marked aria-current="page". The featured block and each section are regions named by their h2s; each item is an article whose title is a link at least 24px tall.',
  motion: "none",
  keyboard: [
    { keys: "Enter", does: "Follows the focused category or item's title" },
  ],
  layout:
    "It's an AppPage, at most 1280px wide (--bt-w-app-page). Its 220px filter column sits beside the catalog, 32 apart, from 900px of column in a shell at least 1100 wide, and above it otherwise; the items go two to a row from 560px of room, their text wraps, and every category and item title is a link at least 24px tall.",
};
