import { Surface } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button, Page, Section, SubNav } from "@buttery/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "SubNav",
  description:
    "A sticky bar of links to the sections of a long page, under the nav bar, marking the section the reader is in.",
  order: 110,
  status: "stable",
  since: "0.7.0",
};

const SECTIONS = [
  {
    id: "sub-nav-overview",
    label: "Overview",
    body: "Our house blend, roasted dark for espresso and milk, $14 a bag.",
  },
  {
    id: "sub-nav-taste",
    label: "Taste",
    body: "Cocoa, toasted hazelnut and brown sugar, low in acidity.",
  },
  {
    id: "sub-nav-beans",
    label: "Beans",
    body: "Cerrado from Brazil and Huila from Colombia, blended after roasting.",
  },
  {
    id: "sub-nav-brewing",
    label: "Brewing",
    body: "18 grams for a double shot, or 30 grams in a French press.",
  },
  {
    id: "sub-nav-delivery",
    label: "Delivery",
    body: "Roasted on Monday and at your door by Thursday.",
  },
] as const;

const LIVE_SECTIONS = SECTIONS.map((section) => ({
  ...section,
  id: section.id.replace("sub-nav-", "live-"),
}));

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Halfmoon House" },
    action: { kind: "toggle", initial: true },
  },
  render: ({ title, action }) => (
    <Surface
      level="card"
      role="region"
      aria-label="Product page"
      tabIndex={0}
      style={{
        blockSize: "calc(var(--bt-bento-row) * 1.5)",
        overflowY: "auto",
      }}
    >
      <Page>
        <SubNav
          title={String(title)}
          items={LIVE_SECTIONS}
          action={
            action === true ? <Button size="sm">Add to bag</Button> : undefined
          }
        />
        {LIVE_SECTIONS.map((section) => (
          <Section
            key={section.id}
            id={section.id}
            size="sm"
            title={section.label}
            body={section.body}
          />
        ))}
      </Page>
    </Surface>
  ),
  code: ({ title, action }) =>
    [
      "<SubNav",
      ...(String(title) === "" ? [] : [`  title="${String(title)}"`]),
      "  items={[",
      ...LIVE_SECTIONS.map(
        (section) => `    { id: "${section.id}", label: "${section.label}" },`,
      ),
      "  ]}",
      ...(action === true
        ? ['  action={<Button size="sm">Add to bag</Button>}']
        : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "A product page",
    description:
      "48px tall under the nav bar. Scroll the page and the underline follows the section you're in on spring.snappy; press a link to jump there. Narrow the page and the links fold into a menu.",
    render: () => (
      <Surface
        level="card"
        role="region"
        aria-label="Sub nav demo"
        tabIndex={0}
        style={{
          blockSize: "calc(var(--bt-bento-row) * 1.5)",
          overflowY: "auto",
        }}
      >
        <Page>
          <SubNav
            title="Halfmoon House"
            items={SECTIONS}
            action={<Button size="sm">Add to bag</Button>}
          />
          {SECTIONS.map((section) => (
            <Section
              key={section.id}
              id={section.id}
              size="sm"
              title={section.label}
              body={section.body}
            />
          ))}
        </Page>
      </Surface>
    ),
  },
];
