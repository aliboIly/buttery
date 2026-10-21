import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "AreaChart",
  kind: "component",
  purpose:
    "Values over time as lines with their area filled in faintly, for totals that build up, with a crosshair and tooltip.",
  useWhen: [
    "Totals that build up over time, such as subscription revenue",
    "One or two series, where the fill helps read how much",
  ],
  avoidWhen: [
    "Several series that cross: use LineChart, whose lines don't cover each other",
    "Counts per period or category: use BarChart",
  ],
  related: ["LineChart", "BarChart", "ChartFrame", "MetricCard"],
  a11y: "The plot is one Tab stop, a slider over the points: Left and Right step through them, Home and End jump to the ends, and each step announces the point's label, values and change. Escape hides the tooltip. A visually hidden table holds every value.",
  motion: "none",
};
