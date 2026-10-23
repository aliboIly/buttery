import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "DateRangeBar",
  kind: "pattern",
  purpose:
    "The period a report covers: a range with presets or two dates, the interval its charts group by, and what it's compared with.",
  useWhen: [
    "Above an overview's metric cards and charts, to set the period they all show",
    "A report page that fetches its data for a range and a comparison",
  ],
  avoidWhen: [
    'Picking one date in a form: use a TextField with type="date"',
    "Filtering a table by date: use a FilterPill",
  ],
  related: ["MetricCard", "LineChart", "Select", "FilterBar"],
  a11y: 'A group named Period holding three selects, each named by what it sets and its current choice. The range list ends with two date fields for a custom range, which Tab reaches from the list. The "compared to" caption is hidden from screen readers, since the comparison select says it.',
  motion: "none",
  keyboard: [
    {
      keys: "Enter, Space, ArrowDown or ArrowUp",
      does: "Opens the focused select's list, with focus on its choice",
    },
    {
      keys: "ArrowDown, ArrowUp, Home or End",
      does: "Moves through the list's options",
    },
    { keys: "A letter", does: "Moves to the option that starts with it" },
    {
      keys: "Enter or Space",
      does: "Chooses the option and closes the list, focus back on the select",
    },
    {
      keys: "Tab",
      does: "Moves from the range's list to its two date fields and back",
    },
    {
      keys: "Escape",
      does: "Closes the list and puts focus back on the select",
    },
  ],
  layout:
    "It fills the width it's given, asking for 640px in a row: three 28px outline selects (--bt-h-sm) 8 apart, the comparison after its caption. Under 640px of its own width the range and the interval share a row in equal halves over the comparison.",
};
