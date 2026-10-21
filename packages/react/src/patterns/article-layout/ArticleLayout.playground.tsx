import type { ReactElement } from "react";
import { Stack, Text, TextStack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ArticleLayout, Page, Section } from "@buttery/react";

const SECTIONS = [
  {
    id: "start",
    title: "Start with a title",
    body: "Type the title in the inspector. The card fits it as you go, and a long title wraps onto a second line rather than shrinking.",
  },
  {
    id: "finish",
    title: "Pick a finish",
    body: "Clear lets the backdrop through, Paper is a soft white and Ink a deep near-black. Each keeps the title readable on any backdrop.",
  },
  {
    id: "lean",
    title: "Lean it in",
    body: "Drag the lean pad and the card turns toward you, up to 20 degrees each way. Flat lays it back down.",
  },
  {
    id: "export",
    title: "Take it with you",
    body: "Copy the card into a post, or export a PNG or a JPG at the canvas's size. The export draws the lean and the shadow as you see them.",
  },
] as const;

function Guide(): ReactElement {
  return (
    <article>
      <Stack gap={12}>
        <TextStack
          size="section"
          title="Making a launch card"
          body="Four steps from a blank canvas to a card in your announcement."
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
