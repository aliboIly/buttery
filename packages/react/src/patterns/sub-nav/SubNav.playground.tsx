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
  since: "0.6.0",
};

const SECTIONS = [
  {
    id: "sub-nav-overview",
    label: "Overview",
    body: "A card for your announcement, ready before the coffee is.",
  },
  {
    id: "sub-nav-features",
    label: "Features",
    body: "Titles that fit themselves, three finishes and a lean you can feel.",
  },
  {
    id: "sub-nav-backdrops",
    label: "Backdrops",
    body: "Blends, solid colors or a picture of your own behind the card.",
  },
  {
    id: "sub-nav-export",
    label: "Export",
    body: "PNG or JPG at the canvas's size, or straight to the clipboard.",
  },
  {
    id: "sub-nav-pricing",
    label: "Pricing",
    body: "Free while you make one card a day. One price for the rest.",
  },
] as const;

const LIVE_SECTIONS = SECTIONS.map((section) => ({
  ...section,
  id: section.id.replace("sub-nav-", "live-"),
}));

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Card Studio" },
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
            action === true ? <Button size="sm">Get it</Button> : undefined
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
        ? ['  action={<Button size="sm">Get it</Button>}']
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
            title="Card Studio"
            items={SECTIONS}
            action={<Button size="sm">Get it</Button>}
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
