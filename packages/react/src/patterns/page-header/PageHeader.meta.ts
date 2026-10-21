import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "PageHeader",
  kind: "pattern",
  purpose:
    "An app page's title with an optional value and its explanation, and the page's actions at the end, folding into a menu.",
  useWhen: [
    "The top of every app page: its title, a headline figure and its actions",
    "Over a page's Tabs and QuickActions, which go in as its children",
  ],
  avoidWhen: [
    "A marketing page's opening: use SplitHero or CenteredHero",
    "The app's top bar with search: use TopBar",
  ],
  related: ["AppPage", "Tabs", "QuickActions", "Button"],
  a11y: "The title is the page's h1. The info button is named by the explanation, which its tooltip shows. Actions are buttons; a disabled one stays focusable, and those folded into the menu stay reachable from the More actions button. A primary action's shortcut is announced through aria-keyshortcuts.",
  motion: "none",
};
