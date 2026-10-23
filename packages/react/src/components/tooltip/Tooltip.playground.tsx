import { Inline, Stack, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button, Tooltip } from "@buttery/react";
import type { TooltipSide } from "@buttery/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Tooltip",
  description:
    "A short label that appears beside an element after the pointer rests on it, or when it takes keyboard focus.",
  order: 120,
  status: "stable",
  since: "0.4.0",
};

const SIDES: readonly [TooltipSide, ...TooltipSide[]] = [
  "top",
  "right",
  "bottom",
  "left",
];

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Saves a 2× PNG to your downloads" },
    side: { kind: "choice", options: SIDES, initial: "top" },
    defaultOpen: { kind: "toggle", initial: false },
  },
  render: ({ label, side, defaultOpen }) => {
    const placed = demoChoice(side, SIDES);
    return (
      <Stack gap={3} align="start">
        <Tooltip
          key={`${String(defaultOpen)}-${placed}-${String(label)}`}
          label={String(label)}
          side={placed}
          defaultOpen={defaultOpen === true}
        >
          <Button>Export</Button>
        </Tooltip>
        <Text variant="caption" tone="secondary">
          {`Rest the pointer on Export, or tab to it, to see “${String(label)}” on its ${placed} side.`}
        </Text>
      </Stack>
    );
  },
  code: ({ label, side, defaultOpen }) =>
    [
      `<Tooltip label="${String(label)}" side="${demoChoice(side, SIDES)}"${defaultOpen === true ? " defaultOpen" : ""}>`,
      "  <Button>Export</Button>",
      "</Tooltip>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "On hover and focus",
    description:
      "Rest the pointer on a button for half a second, or tab to it. Escape closes the tooltip.",
    render: () => (
      <Inline gap={2} wrap>
        <Tooltip label="Saves a copy to your downloads">
          <Button>Export</Button>
        </Tooltip>
        <Tooltip label="Opens below when there's room" side="bottom">
          <Button>Below</Button>
        </Tooltip>
      </Inline>
    ),
  },
];
