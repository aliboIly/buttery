import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { ArrowLink } from "@buttery/react";

export const page: DocsPage = {
  section: "components/actions",
  title: "ArrowLink",
  description:
    "A text link with the navigation arrow, for See all, Learn more and moving through content.",
  order: 10,
  status: "stable",
  since: "0.4.0",
};

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
