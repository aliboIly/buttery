import { Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { buttery } from "@buttery/react";

export const page: DocsPage = {
  section: "motion",
  title: "buttery",
  description:
    "Makes any element or component buttery with token-typed props: a surface, spacing, a layout, press, focus and hover feedback, and an entrance or layout animation.",
  order: 170,
  status: "stable",
  since: "0.3.0",
  home: "motion/presets",
};

export const demos: readonly DemoSection[] = [
  {
    title: "A surface with a layout",
    description:
      "One element takes a surface level, padding and a column with a gap, and rises in as it mounts.",
    render: () => (
      <buttery.section surface="card" pad={4} stack gap={2} enter="rise">
        <Text variant="label">Spring launch</Text>
        <Text variant="caption">Square, blend backdrop, soft edge</Text>
      </buttery.section>
    ),
  },
  {
    title: "Press, focus and hover",
    description:
      "A button that scales while pressed, shows the focus ring and lifts on hover.",
    render: () => (
      <buttery.button
        surface="raised"
        padX={4}
        padY={2}
        radius="full"
        press
        focus
        hover="lift"
      >
        <Text variant="button">Save the card</Text>
      </buttery.button>
    ),
  },
];
