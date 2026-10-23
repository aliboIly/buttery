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
  keyboard: [
    {
      keys: "Tab",
      does: "Reaches the plot and shows the tooltip at the latest point, or at the one last stepped to",
    },
    {
      keys: "Left or Down arrow",
      does: "Moves the crosshair and tooltip to the point before",
    },
    {
      keys: "Right or Up arrow",
      does: "Moves the crosshair and tooltip to the point after",
    },
    { keys: "Home or End", does: "Jumps to the first or last point" },
    { keys: "Escape", does: "Hides the tooltip" },
  ],
  layout:
    'It fills its container\'s width and is 160px tall at size="sm", 220 at "md", the default, and 300 at "lg". The values of its gridlines sit at its end edge; under the plot the first and last labels show, and at "lg" three more once the chart is 640px wide. Axis labels stay on one line. The whole plot is one Tab stop and one pointer target, and the tooltip flips sides at the chart\'s edge to stay inside it.',
};
