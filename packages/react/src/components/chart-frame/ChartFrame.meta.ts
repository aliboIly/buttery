import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ChartFrame",
  kind: "component",
  purpose:
    "The frame buttery's charts are drawn in: gridlines and axis labels, a crosshair or column with a tooltip, keyboard steps, a screen-reader table, and no-data and loading states.",
  useWhen: [
    "Combining marks in one chart, such as bars for orders with a line for bags roasted",
    "Drawing a chart of your own with buttery's axes, hover, keyboard and table, through seriesPath",
  ],
  avoidWhen: [
    "One kind of mark: use LineChart, AreaChart or BarChart",
    "A trend in a table row or beside a number: use Sparkline",
  ],
  related: ["LineChart", "AreaChart", "BarChart", "Sparkline", "MetricCard"],
  a11y: "The plot is one Tab stop, a slider over the points named by the chart's label and described by its summary: Left and Right (or Down and Up) step through the points, Home and End jump to the ends, and each step announces the point's label, its values and the change against the comparison. Escape hides the tooltip. A visually hidden table holds every value. With no data, the box is an image named by the label and the empty message; while loading the pill is a status, outside any busy region so it's read out; announceLoading turns it off when what holds the chart is marked busy.",
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
    "It fills its container's width, and size sets its height: sm 160px, md 220px (the default) or lg 300px, which the no-data and loading states keep. Axis labels stay on one line, the x-axis showing the first and last labels and three more at lg; the tooltip stays inside the frame, and the whole plot is one hit area where pointing anywhere picks the nearest point.",
};
