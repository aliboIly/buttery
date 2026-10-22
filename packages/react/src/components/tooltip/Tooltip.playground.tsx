import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, Tooltip } from "@buttery/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Tooltip",
  description:
    "A short label that appears beside an element after the pointer rests on it, or when it takes keyboard focus.",
  order: 120,
  status: "stable",
  since: "0.4.0",
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
