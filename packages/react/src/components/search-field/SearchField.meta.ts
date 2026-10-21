import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SearchField",
  kind: "component",
  purpose:
    "A field for finding things: a search icon, a clear button once it holds text, and an optional shortcut that focuses it.",
  useWhen: [
    "The app-wide search in a top bar (soft, with a / shortcut)",
    "Narrowing a table or list from its toolbar (outline)",
  ],
  avoidWhen: [
    "A field in a form with a visible label: use TextField",
    "Picking one value from a known list: use Select",
  ],
  related: ["TextField", "TopBar", "FilterBar", "DataTable"],
  a11y: "A searchbox named by its label (Search by default), which is also its placeholder. The clear button is named Clear search; Escape clears the text and keeps focus. A shortcut is announced through aria-keyshortcuts, and its keycap is hidden from screen readers.",
  motion: "none",
};
