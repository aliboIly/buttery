import { Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Container, Page } from "@buttery/react";

export const page: DocsPage = {
  section: "layout",
  title: "Container",
  description:
    "The page's content column: at most 1200px wide, centered, with side padding that grows with the page.",
  order: 120,
  status: "stable",
  since: "0.6.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "A centered column",
    description:
      "At most 1200px wide, with 16, 24 or 32px at the sides as the page passes 640 and 1024px.",
    render: () => (
      <Page>
        <Container>
          <Surface level="section" pad={4}>
            <Text variant="label">Content sits here</Text>
          </Surface>
        </Container>
      </Page>
    ),
  },
];
