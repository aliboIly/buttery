import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "BarChart",
  kind: "component",
  purpose:
    "Values per period or category as bars, side by side for each series, with a column that highlights on hover.",
  useWhen: [
    "Counts per period or category: bags roasted per day, orders per origin",
    "This period's bars beside the last one's",
  ],
  avoidWhen: [
    "Long runs of points, such as a year of days: use LineChart",
    "Parts of a whole: write the numbers, or use StatTabs for a few states",
  ],
  related: ["LineChart", "AreaChart", "ChartFrame", "StatTabs"],
  a11y: "The plot is one Tab stop, a slider over the slots: Left and Right step through them, Home and End jump to the ends, and each step announces the slot's label, values and change. Escape hides the tooltip. A visually hidden table holds every value.",
  motion: "none",
};
