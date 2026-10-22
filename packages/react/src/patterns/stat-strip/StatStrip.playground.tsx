import type { DemoSection, DocsPage } from "@buttery/core";
import { Page, Section, Stat, StatStrip } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "StatStrip",
  description:
    "Equal columns of headline numbers, each with a hairline and a label, the numbers counting up once as they come into view.",
  order: 330,
  status: "stable",
  since: "0.6.0",
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
            <Stat value={1.2} suffix="M+" label="cards exported" />
            <Stat value={48} label="countries" />
            <Stat value={99.9} suffix="%" label="of exports under a second" />
            <Stat value={6} label="canvas shapes" />
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
            <Stat value={24} label="backdrop blends" />
            <Stat value={18} label="flat colors" />
          </StatStrip>
        </Section>
      </Page>
    ),
  },
];
