import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "GroupedList",
  kind: "pattern",
  purpose:
    "Things grouped in one well: card rows with media, a title, a line and a value, under optional titles with a … menu, and a dashed row that adds one more.",
  useWhen: [
    "A short set of records an overview page shows whole: warehouses, payout accounts, this week's roasts",
    "Groups of rows that each lead to their own page",
  ],
  avoidWhen: [
    "Many rows to sort, filter or select: use DataTable",
    "Navigation between pages: use Sidebar",
  ],
  related: ["DataTable", "InitialsTile", "Avatar", "Menu", "AppPage"],
  a11y: "Each group's rows are a list named by its title. A row with href is a link and one with onClick a button, named by its text; the … button is named Actions for the group. The add row is a button named by its label.",
  motion: "none",
  keyboard: [
    { keys: "Enter", does: "Follows a row that's a link" },
    {
      keys: "Enter or Space",
      does: "Presses a row that's a button or the add row, or opens a group's … menu",
    },
    {
      keys: "Escape",
      does: "Closes the open … menu and puts focus back on its button",
    },
  ],
  layout:
    "It takes its container's width as a well padded 4px, its groups and rows 4px apart. Each row is a card at least 48px tall, the whole card its hit area: its title truncates with the full text in its title, its line wraps under it, and its value keeps its width in tabular figures; a group's title truncates the same way beside its 28px … button, and the add row is 48px tall.",
};
