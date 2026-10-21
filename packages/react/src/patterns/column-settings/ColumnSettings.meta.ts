import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ColumnSettings",
  kind: "pattern",
  purpose:
    "A button that opens a list of a table's columns to show, hide and reorder by dragging or with Alt and the arrow keys.",
  useWhen: [
    "A DataTable with more columns than everyone needs",
    "Letting people put a table's columns in their own order",
  ],
  avoidWhen: [
    "Filtering rows: use FilterBar",
    "Switching between saved setups: use SavedViews",
  ],
  related: ["DataTable", "SavedViews", "Popover"],
  a11y: "An icon button named Columns opens a dialog popover. Each column has a checkbox named by it (the first is always on, disabled) and a grip button named Move and the column, which moves it with Alt and Up or Down (announced through aria-keyshortcuts) as well as by dragging.",
  motion: "morph",
};
