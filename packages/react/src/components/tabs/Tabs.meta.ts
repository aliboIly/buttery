import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Tabs",
  kind: "component",
  purpose:
    "Underlined tabs that switch the panel under them, with a sliding underline and the tabs that don't fit in a menu.",
  useWhen: [
    "Sections of one record or page, such as a customer's overview, orders and notes",
    "A page header's views, under its title",
  ],
  avoidWhen: [
    "Tabs that go to other pages: use TabNav",
    "Two to five options that change one setting: use SegmentedControl",
    "Counts per view, such as orders by state: use StatTabs",
  ],
  related: ["TabNav", "SegmentedControl", "StatTabs", "PageHeader"],
  a11y: "A tablist named by its label; arrow keys move between tabs and choose them, Home and End jump to the ends, and Tab moves into the chosen panel, which is named by its tab. Tabs folded into the menu stay reachable from the More tabs button.",
  motion: "indicator",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves to the chosen tab, then to the More tabs button when some tabs have folded, then into the chosen panel",
    },
    {
      keys: "Arrow Right or Arrow Left",
      does: "Moves to the next or previous tab in the row and shows its panel, wrapping at the ends",
    },
    {
      keys: "Home or End",
      does: "Moves to the first or last tab in the row and shows its panel",
    },
    {
      keys: "Enter, Space or Arrow Down",
      does: "Opens the More tabs menu from its button",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Moves through the folded tabs in the menu",
    },
    {
      keys: "Enter or Space",
      does: "Chooses the folded tab focused in the menu and shows its panel",
    },
    {
      keys: "Escape",
      does: "Closes the menu and puts focus back on its button",
    },
  ],
  layout:
    "It fills its container's width: a row of tabs over a 1px line, then the chosen panel 24px below. Each tab is --bt-h-button (36px) tall, as wide as its label, 16px from the next and wholly its own hit area; labels never wrap or truncate: the tabs that don't fit fold into the More tabs menu at the row's end, last ones first, and the chosen tab stays in the row.",
  reducedMotion:
    "The underline appears under the chosen tab at once instead of sliding there.",
};
