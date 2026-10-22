import { Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, CenteredHero, Page } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "CenteredHero",
  description:
    "A page's opening band: a centered two-tone headline, a line and actions above a full-width visual that assembles.",
  order: 160,
  status: "stable",
  since: "0.6.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Words over a wide visual",
    description:
      "The words are centered on at most 8 of 12 columns; the visual takes the column's width under them.",
    render: () => (
      <Page>
        <CenteredHero
          title="One card."
          titleMore="Every size it needs."
          body="Square for a post, wide for a talk, tall for a story."
          actions={
            <Button variant="primary" arrow="forward">
              Start a card
            </Button>
          }
          visual={
            <Surface level="section" pad={12}>
              <Text variant="title">Your card here</Text>
            </Surface>
          }
        />
      </Page>
    ),
  },
];
