import { Inline, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { InfoButton } from "@buttery/react";

export const page: DocsPage = {
  section: "components/actions",
  title: "InfoButton",
  description:
    "An info button that explains a value: on hover and focus in a tooltip, and on a press or a tap in a popover that stays.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

export const live: LiveDemo = {
  controls: {
    info: {
      kind: "text",
      initial: "Bags that left the roaster since Monday.",
    },
    side: {
      kind: "choice",
      options: ["top", "right", "bottom", "left"],
      initial: "bottom",
    },
  },
  render: ({ info, side }) => (
    <InfoButton
      info={String(info)}
      side={demoChoice(side, ["bottom", "top", "right", "left"])}
    />
  ),
};

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
