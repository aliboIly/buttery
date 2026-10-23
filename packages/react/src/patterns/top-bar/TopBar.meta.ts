import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Runs the focused icon action or the create button, or opens the sidebar from the menu button a phone shows",
    },
    {
      keys: "Enter, Space or Down",
      does: "Opens the More app actions menu from its button, where Up and Down move, Enter runs an action and Escape closes",
    },
  ],
  layout:
    'It fills its column at --bt-h-header (56px) with no edge, padded like the page under it: 16px, 24 from 640px of column and 32 from 1024. The search takes up to 360px and narrows before anything overlaps; the icon actions, 36px round hit areas 4px apart, fold into "…" when they don\'t fit, and the 28px create button keeps its place at the end.',
};
