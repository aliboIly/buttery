import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { Footer, Page } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Footer",
  description:
    "The foot of a page: a brand column and columns of links on the page grid, then small print under a divider.",
  order: 180,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
};

const COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Themes", "Export", "What's new"],
  },
  { title: "Help", links: ["Guides", "Shortcuts", "Contact"] },
  { title: "Company", links: ["About", "Careers", "Press kit"] },
  { title: "Follow", links: ["Newsletter", "Changelog feed"] },
] as const;

function slug(label: string): string {
  return label.toLowerCase().replaceAll(/[^a-z]+/g, "-");
}

function Brand(): ReactElement {
  return (
    <Stack gap={2}>
      <Text variant="title">Deckhand</Text>
      <Text variant="body-sm" tone="secondary">
        Slide decks for every meeting, made in an afternoon.
      </Text>
    </Stack>
  );
}

function Legal(): ReactElement {
  return (
    <Inline gap={4} justify="between">
      <Text variant="caption" tone="secondary">
        © 2026 Deckhand
      </Text>
      <Inline gap={4}>
        <Footer.Link href="#privacy">Privacy</Footer.Link>
        <Footer.Link href="#terms">Terms</Footer.Link>
      </Inline>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Site footer",
    description:
      "The brand takes 4 of 12 columns and each column of links 2. Under 1024px of footer the brand takes a row; the columns go four to a row, then two.",
    render: () => (
      <Page>
        <Footer brand={<Brand />} legal={<Legal />}>
          {COLUMNS.map((column) => (
            <Footer.Column key={column.title} title={column.title}>
              {column.links.map((label) => (
                <Footer.Link key={label} href={`#${slug(label)}`}>
                  {label}
                </Footer.Link>
              ))}
            </Footer.Column>
          ))}
        </Footer>
      </Page>
    ),
  },
];
