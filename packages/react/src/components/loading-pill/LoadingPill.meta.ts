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
  a11y: "A polite status region stays mounted and gets its words when the pill appears, so they're announced, unless announce is off because something around it, such as a card marked busy, already says it's loading; the pill itself is hidden from screen readers. The spinner is decorative and holds still with reduced motion.",
  motion: "presence",
  keyboard: [],
  layout:
    "A pill 28px tall (--bt-h-sm) and as wide as its 14px spinner and its label, padded 12px a side; it never wraps or shrinks. It takes no presses, so it has no hit area.",
  reducedMotion:
    "It still waits 300ms, then fades in and out over 100ms, and its spinner holds still.",
};
