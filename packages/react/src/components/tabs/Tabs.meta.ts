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
};
