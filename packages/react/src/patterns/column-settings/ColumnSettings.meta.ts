import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens the list from the Columns button, or presses Reset",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves between each column's grip and checkbox, then Reset",
    },
    {
      keys: "Space",
      does: "Shows or hides the focused column; the first one always shows",
    },
    {
      keys: "Alt+ArrowUp or Alt+ArrowDown",
      does: "Moves the focused column one place up or down",
    },
    {
      keys: "Escape",
      does: "Closes the list and puts focus back on the Columns button",
    },
  ],
  layout:
    "The Columns button is a 36px icon button (--bt-h-button). Its popover is 240px wide, never wider than the room it has, with a row per column at least 28px tall (--bt-h-sm), 4 apart: a 24px grip and the column's checkbox, whose name wraps.",
  reducedMotion:
    'The list fades in and out in 100ms instead of growing from the button (inside AppShell layout="sidebar" it appears at once either way), and a moved column\'s neighbours take their new places at once instead of sliding.',
};
