import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { TagChip } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "TagChip",
  description: "A small outlined tag with a colored dot.",
  order: 80,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Tones",
    description: "The dot takes its tone's color; the words say what it is.",
    render: () => (
      <Inline gap={2} align="center" wrap>
        <TagChip tone="info">New</TagChip>
        <TagChip tone="warning">Popular</TagChip>
        <TagChip tone="success">Free trial</TagChip>
        <TagChip>Easy setup</TagChip>
      </Inline>
    ),
  },
];
