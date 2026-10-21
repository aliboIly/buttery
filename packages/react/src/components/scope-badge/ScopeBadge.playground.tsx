import { Inline, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { ScopeBadge } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "ScopeBadge",
  description:
    "A badge after a settings page's title that says what its settings apply to.",
  order: 70,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "After a title",
    description:
      "Hover or focus it for the details; press it to keep them open.",
    render: () => (
      <Inline gap={2} align="center">
        <Text variant="title-lg" asChild>
          <h2>Pickup</h2>
        </Text>
        <ScopeBadge
          label="All shops"
          info="Changes here apply to every Halfmoon shop."
        />
      </Inline>
    ),
  },
];
