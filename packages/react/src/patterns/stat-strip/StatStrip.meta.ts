import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "StatStrip",
  kind: "pattern",
  purpose:
    "Equal columns of headline numbers, each with a hairline and a label, the numbers counting up once as they come into view.",
  useWhen: [
    "A few proud numbers on a marketing page: people, countries, things made",
  ],
  avoidWhen: [
    "Numbers people work with in an app: use MetricCard",
    "Values someone set: never count those up",
  ],
  related: ["Section", "Page", "MetricCard"],
  a11y: "A list of stats; each reads its final number and its label from the start, since the counting is drawn over a hidden copy. With reduced motion the numbers show at once.",
  motion: "presence",
  keyboard: [],
  layout:
    "It fills its parent's width in four equal columns 24px apart (two with columns={2}), each stat behind a 1px hairline, and four fall into two rows of two while the strip is under 640px wide. Numbers are heading-1 in four columns and display in two, in tabular figures with room kept for the final number; one too long for its column breaks rather than spilling, and the strip has no hit areas.",
  reducedMotion:
    "The numbers show their final values at once instead of counting up.",
};
