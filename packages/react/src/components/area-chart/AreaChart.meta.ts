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
  keyboard: [
    {
      keys: "ArrowRight or ArrowUp",
      does: "Moves to the next point and shows its tooltip, announcing its label, values and change",
    },
    { keys: "ArrowLeft or ArrowDown", does: "Moves to the previous point" },
    { keys: "Home or End", does: "Jumps to the first or the last point" },
    { keys: "Escape", does: "Hides the tooltip" },
  ],
  layout:
    "It fills its container's width, and size sets its height: sm 160px, md 220px (the default) or lg 300px. Axis labels stay on one line, the x-axis showing the first and last labels and three more at lg, and the whole plot is one hit area where pointing anywhere picks the nearest point.",
};
