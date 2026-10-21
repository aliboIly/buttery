import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "MetricCard",
  kind: "pattern",
  purpose:
    "One metric on a card: its title, value and change against the previous period, a small chart of both periods, and when it was updated.",
  useWhen: [
    "An overview page's headline numbers: total sales, new subscribers, refund rate",
    "A number whose trend matters as much as its value",
  ],
  avoidWhen: [
    "A number with no history: use StatStrip or plain Text",
    "Many numbers in rows: use DataTable, with a Sparkline per row",
  ],
  related: ["LineChart", "DateRangeBar", "Sparkline", "AppPage", "StatTabs"],
  a11y: "A group named by its title, which is an h3 by default. The info button is named by the explanation its tooltip shows. The chart is a slider over its points, described by the change. The footer's link is named Details for and the title; the expand button repeats it for the pointer only, so it's hidden from screen readers and Tab. While loading the card is marked busy and its skeletons are hidden.",
  motion: "none",
};
