import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "StatTabs",
  kind: "pattern",
  purpose:
    "Equal tabs over a list that each show a view's count, the chosen one on a sliding raised panel, a select on a phone.",
  useWhen: [
    "Splitting a table by state with how many rows each holds: All, Unpaid, Shipped",
    "Three to five views where the counts matter",
  ],
  avoidWhen: [
    "Named filters people save: use SavedViews",
    "Sections of a record: use Tabs",
  ],
  related: ["SavedViews", "Tabs", "DataTable", "Select"],
  a11y: "A radio group named by its label; each tab is a radio named by its label and count, and arrow keys move the choice. Under 640px it's a select named by the same label.",
  motion: "indicator",
};
