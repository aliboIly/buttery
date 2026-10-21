import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "LoadingPill",
  kind: "component",
  purpose:
    "A small pill with a spinner that says something is loading, shown only once loading has lasted 300ms.",
  useWhen: [
    "A chart or panel waiting for its data, centered over its box",
    "A refresh that keeps the old content in place while it loads",
  ],
  avoidWhen: [
    "A table or list's first load: show skeleton rows shaped like the content",
    "A button's own action: use Button's loading state",
  ],
  related: ["Button", "DataTable", "MetricCard"],
  a11y: "A status (a polite live region) that says what's loading when it appears. The spinner is decorative and holds still with reduced motion.",
  motion: "presence",
};
