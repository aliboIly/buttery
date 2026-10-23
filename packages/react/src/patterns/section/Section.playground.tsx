import type { ReactElement } from "react";
import { Grid, Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { Page, Section } from "@butteryui/react";

export const page: DocsPage = {
  section: "layout",
  title: "Section",
  description:
    "A band of a page: room above and below, an optional heading and body, and its content in a Container.",
  order: 190,
  status: "stable",
  since: "0.7.0",
  home: "layout/page-grid-and-containers",
};

function Tile({ label }: { readonly label: string }): ReactElement {
  return (
    <Surface level="section" pad={6}>
      <Text variant="label">{label}</Text>
    </Surface>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Heading, body and content",
    description:
      "The heading and body sit 48px above the content, 64 once the page is past 1024px.",
    render: () => (
      <Page>
        <Section
          size="sm"
          title="Everything a slide needs"
          body="A theme, a background, a layout and speaker notes, all in one panel."
        >
          <Grid columns={{ base: 1, md: 3 }} gap={4}>
            <Tile label="Theme" />
            <Tile label="Background" />
            <Tile label="Layout" />
          </Grid>
        </Section>
      </Page>
    ),
  },
  {
    title: "Centered and muted",
    render: () => (
      <Page>
        <Section size="sm" tone="muted" align="center" title="Kept in step">
          <Text variant="body-lg">Undo and redo remember every change.</Text>
        </Section>
      </Page>
    ),
  },
];
