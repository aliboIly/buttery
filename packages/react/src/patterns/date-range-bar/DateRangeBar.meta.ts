import type { ComponentMeta } from "@buttery/core";

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
};
