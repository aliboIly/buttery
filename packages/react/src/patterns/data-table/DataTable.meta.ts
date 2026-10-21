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
};
