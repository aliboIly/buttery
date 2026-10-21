import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "LineChart",
  kind: "component",
  purpose:
    "Values over time as smooth lines, the comparison in gray beneath, with a crosshair and tooltip that follow the pointer.",
  useWhen: [
    "A value over time, such as daily volume, against the period before",
    "Two to five series on one scale, such as orders per origin",
  ],
  avoidWhen: [
    "Totals that build up: use AreaChart",
    "Counts per period or category compared side by side: use BarChart",
    "A trend in a table row or beside a number: use Sparkline",
  ],
  related: ["AreaChart", "BarChart", "Sparkline", "ChartFrame", "MetricCard"],
  a11y: "The plot is one Tab stop, a slider over the points: Left and Right step through them, Home and End jump to the ends, and each step announces the point's label, values and change. Escape hides the tooltip. A visually hidden table holds every value.",
  motion: "none",
};
