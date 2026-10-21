import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "FilterBar",
  kind: "pattern",
  purpose:
    "A row of filter pills over a list that wrap as they're applied, with Clear filters and actions, folding into one button on a phone.",
  useWhen: [
    "Filtering a table by its fields: status, date, customer",
    "Showing which filters are applied, each removable",
  ],
  avoidWhen: [
    "Named sets of filters people return to: use SavedViews",
    "One search box: use SearchField",
  ],
  related: ["DataTable", "SavedViews", "SearchField", "Popover"],
  a11y: 'A group named Filters. Each pill is a button named by its field and value ("Status: Paid", shown as "Status | Paid") that opens its editor in a popover; an applied pill\'s remove button is named Remove and the field, with a 24px press area. On a phone the pills move behind one Filters button that says how many are applied.',
  motion: "presence",
};
