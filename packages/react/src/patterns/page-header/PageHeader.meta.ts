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
  related: ["AppPage", "Tabs", "QuickActions", "Button", "InfoButton"],
  a11y: "The title is the page's h1. The info button is named by the explanation, which its tooltip shows and a press opens in a popover. Actions are buttons; a disabled one stays focusable, and those folded into the menu stay reachable from the More page actions button. An action's shortcut is bound, and announced through aria-keyshortcuts in the row and in the menu. Breadcrumbs go before the h1 as their own navigation landmark; a scope badge is a button after the title; the description is a paragraph under the title's row.",
  motion: "none",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Runs the focused action, opens the value's explanation from its info button, or opens More page actions with the actions that don't fit",
    },
    {
      keys: "An action's shortcut, such as N",
      does: "Runs that action from anywhere on the page, unless it's disabled or focus is in a text field, a menu or a modal dialog",
    },
    {
      keys: "Arrow keys",
      does: "Move through More page actions while it's open",
    },
    {
      keys: "Escape",
      does: "Closes More page actions or the value's explanation",
    },
  ],
  layout:
    "It takes its container's width. The title's row is at least 36px tall with the actions at its end, 8px apart; as it narrows the actions fold into More page actions, the lowest priority first, and only then does the title truncate, with its full text in its title. The value keeps its width in tabular figures, the description wraps under the row, and rows passed as children sit 16px below.",
};
