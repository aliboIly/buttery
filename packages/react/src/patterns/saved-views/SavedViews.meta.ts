import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SavedViews",
  kind: "pattern",
  purpose:
    "A track of saved views of a list, the chosen one on a sliding raised pill, with every view and its actions in a menu.",
  useWhen: [
    "Named filters over a table people come back to, such as Unpaid or Wholesale",
    "Letting people save the current filters as a view of their own",
  ],
  avoidWhen: [
    "Counts per state: use StatTabs",
    "Sections of a record: use Tabs",
    "A setting with two to five options: use SegmentedControl",
  ],
  related: ["DataTable", "FilterBar", "StatTabs", "SegmentedControl"],
  a11y: "A radio group named by its label: arrow keys move between views and choose them. The More views button opens a menu with every view as a menuitemradio (the chosen one checked), then the actions and Save as a new view.",
  motion: "indicator",
};
