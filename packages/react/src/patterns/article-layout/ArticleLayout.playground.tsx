import type { ReactElement } from "react";
import { Stack, Text, TextStack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { ArticleLayout, Page, Section } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "ArticleLayout",
  description:
    "An article beside a sticky aside on the page grid: 8 columns for the article, the last 3 for the aside.",
  order: 130,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
};

const SECTIONS = [
  {
    id: "start",
    title: "Start with a title",
    body: "Type the title in the inspector and it lands on the slide with every key. A long title wraps onto a second line rather than shrinking.",
  },
  {
    id: "theme",
    title: "Pick a theme",
    body: "Plain lets the background show through, Paper is a soft white and Ink a deep near-black. Each keeps the title readable on any background.",
  },
  {
    id: "tilt",
    title: "Tilt a picture",
    body: "Steer the tilt pad and the picture tips toward you, up to 20 degrees each way. Flat lays it back down.",
  },
  {
    id: "export",
    title: "Take it with you",
    body: "Save the deck as a PDF or one slide as a PNG, or press Copy and paste the slide wherever it's going. The export draws the tilt and the shadow just as the editor shows them.",
  },
] as const;

function Guide(): ReactElement {
  return (
    <article>
      <Stack gap={12}>
        <TextStack
          size="section"
          title="Making your first deck"
          body="Four steps from a blank slide to a deck you can present."
        />
        {SECTIONS.map((section) => (
          <Stack key={section.id} gap={4}>
            <h2
              id={`guide-${section.id}`}
              className="bt-text"
              data-role="heading-2"
            >
              {section.title}
            </h2>
            <Text variant="body-lg">{section.body}</Text>
            <Text variant="body-lg">{section.body}</Text>
          </Stack>
        ))}
      </Stack>
    </article>
  );
}

/** A link to a section of the article, a 24px target in `body-sm`. */
function SectionLink({
  href,
  children,
}: {
  readonly href: string;
  readonly children: string;
}): ReactElement {
  return (
    <Text variant="body-sm" tone="secondary" asChild>
      <a
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          minBlockSize: "var(--bt-space-6)",
          textDecoration: "none",
        }}
      >
        {children}
      </a>
    </Text>
  );
}

function OnThisPage(): ReactElement {
  return (
    <nav aria-label="Sections">
      <Stack gap={3}>
        <Text variant="label" tone="secondary">
          On this page
        </Text>
        <Stack gap={1}>
          {SECTIONS.map((section) => (
            <SectionLink key={section.id} href={`#guide-${section.id}`}>
              {section.title}
            </SectionLink>
          ))}
        </Stack>
      </Stack>
    </nav>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "A guide with its sections beside it",
    description:
      "The article takes 8 of 12 columns and the aside the last 3, a column apart. The aside sticks under the bars and stops at the end of the article; under 1024px of room it follows the article.",
    render: () => (
      <Page>
        <Section size="sm">
          <ArticleLayout aside={<OnThisPage />} asideLabel="On this page">
            <Guide />
          </ArticleLayout>
        </Section>
      </Page>
    ),
  },
];
