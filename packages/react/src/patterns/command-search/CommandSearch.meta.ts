import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "CommandSearch",
  kind: "pattern",
  purpose:
    "The top bar's search: a field that widens as it takes focus over a panel of grouped results from typed sources, with key:value filters, recent searches and a link to every result.",
  useWhen: [
    "The app-wide search in a TopBar: pages, records and help in one place",
    "A search that takes key:value filters, such as status:shipped",
  ],
  avoidWhen: [
    "Narrowing one table or list: use SearchField",
    "Choosing one value in a form: use Select",
  ],
  related: ["TopBar", "SearchResults", "SearchField", "AppShell"],
  a11y: "A combobox named by its label that controls a listbox named Results, in a panel with no role of its own. Focus stays in the field while the arrow keys move through the rows across groups and on to the footer's link (aria-activedescendant); Enter opens the row, or every result when no row is chosen; Escape clears, then closes. Each group is named by its heading. The field is described by its finished filters, and a polite status line says how many results its sources found, or that nothing matched, once typing pauses. / and ⌘K focus it. A chip's remove button is named for its filter and takes Tab, and Backspace at the start of the field removes the last chip. Keys an input method is composing with are left alone.",
  motion: "morph",
};
