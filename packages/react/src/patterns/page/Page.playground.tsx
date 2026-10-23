import { Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { Page, Section } from "@butteryui/react";

export const page: DocsPage = {
  section: "layout",
  title: "Page",
  description:
    "A marketing or content page: a column of sections that the page grid, side padding and headline sizes follow.",
  order: 180,
  status: "stable",
  since: "0.7.0",
  home: "layout/page-grid-and-containers",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Sections on a page",
    description:
      "The page is the size container: headlines and padding follow its width, not the window's.",
    render: () => (
      <Page>
        <Section size="sm" title="Made for meeting days">
          <Text variant="body-lg">
            One deck for the projector, the call and the inbox.
          </Text>
        </Section>
        <Section size="sm" tone="muted" title="Kept in step">
          <Text variant="body-lg">Undo and redo remember every change.</Text>
        </Section>
      </Page>
    ),
  },
];
