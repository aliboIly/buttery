import type { DemoSection, DocsPage } from "@butteryui/core";
import { Page, Section, Stat, StatStrip } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "StatStrip",
  description:
    "Equal columns of headline numbers, each with a hairline and a label, the numbers counting up once as they come into view.",
  order: 330,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Four numbers",
    description:
      "Each counts up over 800ms once it's in view, in tabular figures with the final number's room kept.",
    render: () => (
      <Page>
        <Section size="sm">
          <StatStrip>
            <Stat value={1.2} suffix="M+" label="decks presented" />
            <Stat value={48} label="countries" />
            <Stat value={99.9} suffix="%" label="of exports under a second" />
            <Stat value={6} label="slide sizes" />
          </StatStrip>
        </Section>
      </Page>
    ),
  },
  {
    title: "Two numbers",
    render: () => (
      <Page>
        <Section size="sm">
          <StatStrip columns={2}>
            <Stat value={24} label="background gradients" />
            <Stat value={18} label="solid colors" />
          </StatStrip>
        </Section>
      </Page>
    ),
  },
  {
    title: "Cards",
    description:
      "layout cards puts each stat on a card of its own, 16px apart, in the columns a row has.",
    render: () => (
      <Page>
        <Section size="sm" tone="muted">
          <StatStrip layout="cards">
            <Stat value={1.2} suffix="M+" label="decks presented" />
            <Stat value={48} label="countries" />
            <Stat value={99.9} suffix="%" label="of exports under a second" />
            <Stat value={6} label="slide sizes" />
          </StatStrip>
        </Section>
      </Page>
    ),
  },
  {
    title: "Stacked",
    description:
      "layout stacked puts the stats in one column with a hairline between them, for a narrow column such as an aside.",
    render: () => (
      <div style={{ maxInlineSize: "var(--bt-w-aside)" }}>
        <StatStrip layout="stacked">
          <Stat value={24} label="background gradients" />
          <Stat value={18} label="solid colors" />
          <Stat value={6} label="slide sizes" />
        </StatStrip>
      </div>
    ),
  },
  {
    title: "Large",
    description:
      "size lg sets display numbers over body-lg labels, in four columns too.",
    render: () => (
      <Page>
        <Section size="sm">
          <StatStrip size="lg">
            <Stat value={1.2} suffix="M+" label="decks presented" />
            <Stat value={48} label="countries" />
            <Stat value={99.9} suffix="%" label="of exports under a second" />
            <Stat value={6} label="slide sizes" />
          </StatStrip>
        </Section>
      </Page>
    ),
  },
];
