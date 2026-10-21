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
};
