import { Inline, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { InfoButton } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Beside a title",
    description:
      "Hover or focus it for the tooltip; press or tap it and the words stay in a popover until Escape or a press elsewhere.",
    render: () => (
      <Inline gap={1} align="center">
        <Text variant="title-sm">Roasted this week</Text>
        <InfoButton info="Bags that left the roaster since Monday, before any were packed." />
      </Inline>
    ),
  },
];
