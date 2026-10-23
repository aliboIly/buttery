import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "MetricCard",
  kind: "pattern",
  purpose:
    "One metric on a card: its title, value and change against the previous period, a small chart of both periods, and when it was updated.",
  useWhen: [
    "An overview page's headline numbers: sales, new subscribers, refund rate",
    "A number whose trend matters as much as its value",
  ],
  avoidWhen: [
    "A number with no history: use StatStrip or plain Text",
    "Many numbers in rows: use DataTable, with a Sparkline per row",
  ],
  related: [
    "LineChart",
    "DateRangeBar",
    "Sparkline",
    "AppPage",
    "StatTabs",
    "InfoButton",
  ],
  a11y: "A group named by its title, which is an h3 by default. The info button is named by the explanation its tooltip shows. The chart is a slider over its points, described by the change. The footer's link is named Details for and the title; the expand button repeats it for the pointer only, so it's hidden from screen readers and Tab. While loading the card is marked busy, its skeletons are hidden and its chart's pill isn't read out, so a page of loading cards isn't announced once per card.",
  motion: "morph",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens what the metric means from the info button, in a popover that Tab or a press elsewhere also closes",
    },
    {
      keys: "Left and Right arrows",
      does: "Step through the chart's points, announcing each one's label, values and change",
    },
    { keys: "Home or End", does: "Jumps to the chart's first or last point" },
    {
      keys: "Escape",
      does: "Closes the info popover, or hides the chart's tooltip",
    },
    { keys: "Enter", does: "Follows the Details link" },
  ],
  layout:
    "It takes its container's width on a card padded 16px: the title truncates with its full text in its title, the value is title-lg in tabular figures, the change wraps under it, and the chart is 160px tall. While it loads, each part's skeleton holds that part's place, so nothing moves when the numbers arrive; the info button is 28px square.",
  reducedMotion:
    "Its skeletons don't shimmer, and they crossfade into the numbers in 100ms.",
};
