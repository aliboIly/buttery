import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "HeaderBar",
  kind: "pattern",
  purpose:
    "An app's top bar: its mark and title, then actions that fold into a More menu when there isn't room.",
  useWhen: [
    "The top of an app window or editor: the document's name and the actions that apply to it",
  ],
  avoidWhen: [
    "A marketing site's navigation: use NavBar (Phase 6)",
    "Actions for one mode: use FloatingToolbar",
  ],
  related: ["AppShell", "OverflowCluster", "Select", "IconButton"],
  a11y: 'A header holding a title and buttons. Actions that don\'t fit move into a "More actions" menu (a menu button), never off screen; icon-only actions are named by their labels, with tooltips. With dragRegion the desktop window drags from the bar while its buttons keep taking presses.',
  motion: "none",
};
