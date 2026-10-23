import { Inline, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ScopeBadge } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "ScopeBadge",
  description:
    "A badge after a settings page's title that says what its settings apply to.",
  order: 130,
  status: "new",
  since: "0.8.0",
};

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "All shops" },
    open: { kind: "toggle", initial: false },
    info: {
      kind: "text",
      initial: "Changes here apply to every Halfmoon shop.",
    },
  },
  render: ({ label, open, info }) => (
    <ScopeBadge
      label={String(label)}
      open={open === true ? true : undefined}
      info={String(info)}
    />
  ),
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
