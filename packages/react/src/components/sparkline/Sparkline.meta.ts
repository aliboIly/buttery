import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Sparkline",
  kind: "component",
  purpose:
    "A trend at a glance: one small line, no axes, its last point marked, for a table row or beside a number.",
  useWhen: [
    "A trend beside the number it belongs to, in a card or a table row",
    "Many small trends to scan, one per row",
  ],
  avoidWhen: [
    "Reading values off it: use LineChart, which has axes and a tooltip",
    "Comparing series: use LineChart",
  ],
  related: ["LineChart", "MetricCard", "DataTable"],
  a11y: "An image named by its label. It has no tooltip or Tab stop, so write the numbers it summarizes beside it.",
  motion: "none",
};
