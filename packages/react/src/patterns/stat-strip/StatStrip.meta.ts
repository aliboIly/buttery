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
};
