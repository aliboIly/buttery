import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "TabNav",
  kind: "component",
  purpose:
    "Underlined tabs that go to other pages, marking the current one, with the links that don't fit in a menu.",
  useWhen: [
    "Views of a list that each have their own address, such as All, Open and Shipped orders",
    "Sections of settings that are pages of their own",
  ],
  avoidWhen: [
    "Panels on the same page: use Tabs",
    "Sections down a long page: use SubNav",
  ],
  related: ["Tabs", "SubNav", "PageHeader"],
  a11y: 'A navigation named by its label; the current link has aria-current="page". Tab moves along the links. Links folded into the menu stay reachable from the More pages button, and choosing one follows it.',
  motion: "indicator",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves along the links, then to the More pages button once some have folded into it",
    },
    {
      keys: "Enter",
      does: "Follows the focused link, or the folded link focused in the menu",
    },
    {
      keys: "Enter, Space or Arrow Down",
      does: "Opens the More pages menu from its button",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Moves through the folded links in the menu",
    },
    {
      keys: "Escape",
      does: "Closes the menu and puts focus back on its button",
    },
  ],
  layout:
    "It fills its container's width over a 1px line. Its links are --bt-h-button (36px) tall and 16px apart, each as wide as its text and padding and each wholly its own hit area; they never wrap or truncate: the ones that don't fit fold into the More pages menu at the end, last ones first, and the current page's link stays in the row.",
  reducedMotion:
    "The underline appears under the current page's link at once instead of sliding there.",
};
