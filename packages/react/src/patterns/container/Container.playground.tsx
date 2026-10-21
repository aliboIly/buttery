import { Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Container, Page } from "@buttery/react";

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
