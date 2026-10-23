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

function columns(): ReactElement[] {
  return COLUMNS.map((column) => (
    <Footer.Column key={column.title} title={column.title}>
      {column.links.map((label) => (
        <Footer.Link key={label} href={`#${slug(label)}`}>
          {label}
        </Footer.Link>
      ))}
    </Footer.Column>
  ));
}

export const demos: readonly DemoSection[] = [
  {
    title: "Site footer",
    description:
      "The brand takes 4 of 12 columns and each column of links 2. Under 1024px of footer the brand takes a row; the columns go four to a row, then two.",
    render: () => (
      <Page>
        <Footer brand={<Brand />} legal={<Legal />}>
          {columns()}
        </Footer>
      </Page>
    ),
  },
  {
    title: "Centered",
    description:
      "layout centered sets the brand over the columns over the small print, each on the footer's middle, the columns wrapping onto more rows as it narrows.",
    render: () => (
      <Page>
        <Footer layout="centered" brand={<Brand />} legal={<Legal />}>
          {columns()}
        </Footer>
      </Page>
    ),
  },
  {
    title: "Simple",
    description:
      "layout simple makes one row of links, each column's heading kept for screen readers only, with the small print at its end; under 640px of footer the small print goes under the links.",
    render: () => (
      <Page>
        <Footer
          layout="simple"
          legal={
            <Text variant="caption" tone="secondary">
              © 2026 Deckhand
            </Text>
          }
        >
          <Footer.Column title="Product">
            <Footer.Link href="#features">Features</Footer.Link>
            <Footer.Link href="#themes">Themes</Footer.Link>
            <Footer.Link href="#export">Export</Footer.Link>
          </Footer.Column>
          <Footer.Column title="Company">
            <Footer.Link href="#about">About</Footer.Link>
            <Footer.Link href="#privacy">Privacy</Footer.Link>
            <Footer.Link href="#terms">Terms</Footer.Link>
          </Footer.Column>
        </Footer>
      </Page>
    ),
  },
];
