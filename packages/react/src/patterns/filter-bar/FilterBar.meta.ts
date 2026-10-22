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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens a pill's editor, removes a filter from its remove button, clears them all from Clear filters, or, folded on a phone, opens the pills",
    },
    {
      keys: "Escape",
      does: "Closes the open editor and puts focus back on its pill",
    },
  ],
  layout:
    'It takes its container\'s width: the pills sit 8px apart and wrap onto more lines as filters are applied, the actions stay at the end of the first line, and under 640px of its own width the pills fold into one "Filters · 2" button. Each pill is 28px tall (--bt-h-sm) and truncates its "Field | value" with the full text in its title, and its 16px remove button has a 24px press area.',
  reducedMotion:
    "A pill's editor, and the folded pills on a phone, fade in and out in 100ms without growing.",
};
