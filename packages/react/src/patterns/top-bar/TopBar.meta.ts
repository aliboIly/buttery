import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "TopBar",
  kind: "pattern",
  purpose:
    "The bar over a dashboard's page: search at its start, icon actions and a round create button at its end.",
  useWhen: [
    'The top of an AppShell layout="sidebar", over every page',
    "App-wide search with a / shortcut, notifications and a create button",
  ],
  avoidWhen: [
    "A page's own title and actions: use PageHeader",
    "An editor's title bar: use HeaderBar",
    "A marketing site's bar: use NavBar",
  ],
  related: ["AppShell", "SearchField", "IconButton", "PageHeader"],
  a11y: 'Its icon actions are buttons named by their labels, which their tooltips show; a dot adds ", new" to the name, in the row and in the menu. Actions folded into the menu stay reachable from the More app actions button, which shows a dot and adds ", new" to its name while a folded action has one. On a phone, its first button opens the sidebar, named Open navigation.',
  motion: "none",
};
