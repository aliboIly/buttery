import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "DataTable",
  kind: "pattern",
  purpose:
    "A table of records: columns with minimum widths and shares, selection, sorting, row actions, a sticky header and first column, skeleton rows and pagination.",
  useWhen: [
    "Lists of records people scan, sort and act on: orders, customers, payouts",
    'A short list in an overview (size="compact")',
  ],
  avoidWhen: [
    "Items grouped under headings with an add row: use GroupedList",
    "A handful of settings: use an Inspector or a form",
    "Content cards: use Grid",
  ],
  related: [
    "StatusBadge",
    "SavedViews",
    "FilterBar",
    "ColumnSettings",
    "AppPage",
  ],
  a11y: "ARIA table roles on grid rows: a table named by its label, columnheaders with aria-sort on sortable ones (buttons inside), cells. Row checkboxes are named Select and the row's label; the header box selects the page and reads mixed when some are. A row's actions button is named Actions for and the row's label. While loading, the table is aria-busy and says it's loading rows. Its scroll area is a region named by the label, and takes focus while its columns or rows overflow, so the keyboard can scroll it.",
  motion: "presence",
  keyboard: [
    {
      keys: "Tab or Shift+Tab",
      does: "Moves through its checkboxes, sortable headers, links, row actions and pagination, and onto its scroll area while it overflows",
    },
    {
      keys: "Space",
      does: "Ticks or clears the focused checkbox; the header's selects the whole page",
    },
    {
      keys: "Enter or Space",
      does: "Sorts by the focused header (ascending, then descending, then none), or opens a row's actions",
    },
    {
      keys: "Arrow keys",
      does: "Scroll the table while its scroll area has focus",
    },
  ],
  layout:
    "It fills its container's width. Each column keeps its least width (minWidth: xs 64, sm 96 by default, md 144, lg 192 or xl 256px) and a share of the rest, and when those don't fit the table scrolls sideways inside itself while the page doesn't, its end edge fading while more lies past it; rows are 36px (--bt-h-table-row) with 1px dividers, cells never wrap but truncate with their full text on hover, and the header and first column stick as it scrolls. Give an amount or a date column minWidth md, so its values fit whole on a phone.",
  reducedMotion:
    "Skeleton rows don't shimmer, and the rows that replace them fade in over 100ms.",
};
