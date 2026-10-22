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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Presses the focused action, or opens More actions with the actions that don't fit",
    },
    {
      keys: "Arrow keys",
      does: "Move through More actions while it's open, where Enter chooses an action",
    },
    {
      keys: "Escape",
      does: "Closes More actions and puts focus back on its button",
    },
  ],
  layout:
    "It takes its container's width at 56px tall (--bt-h-header), padded 16px a side, or past the window controls at the start with dragRegion in the desktop app. The 24px mark and the actions keep their size and never wrap: as the bar narrows the lowest-priority actions fold into More actions first, and only then does the title truncate, with its full text in its title.",
};
