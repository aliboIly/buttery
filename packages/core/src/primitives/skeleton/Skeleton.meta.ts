import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Skeleton",
  kind: "primitive",
  purpose:
    "A shimmering placeholder for something still loading, shaped like the text or block it stands in for.",
  useWhen: [
    "A part whose content is on its way, such as a metric's value or a card's lines, so the layout holds still when it arrives",
    "Building a component's loading state: give each part a skeleton in its own place",
  ],
  avoidWhen: [
    "Loads that usually finish in under 300ms: show nothing, or a LoadingPill, which waits",
    "A whole chart: charts take loading and show a LoadingPill in their box",
  ],
  related: ["LoadingPill", "Text", "DataTable", "MetricCard"],
  a11y: "Hidden from screen readers. Mark the region that's loading with aria-busy, and announce the load with a LoadingPill or a status message if it takes a while.",
  motion: "loop",
};
