import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ArrowLink } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Forward and back",
    description:
      "Hover or focus a link: the chevron grows a stem, and the link keeps its width.",
    render: () => (
      <Inline gap={6} wrap>
        <ArrowLink href="#/arrow-link">See all templates</ArrowLink>
        <ArrowLink href="#/button" arrow="back">
          Back to buttons
        </ArrowLink>
      </Inline>
    ),
  },
];
