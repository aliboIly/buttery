import type { ReactElement } from "react";
import { Stack, Stagger, Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import { Button, Page, SplitHero } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "SplitHero",
  description:
    "A page's opening band: a two-tone headline, a line and actions beside a visual that assembles as it arrives.",
  order: 310,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
};

const LILAC = gradients.find((preset) => preset.id === "lilac");

function Preview(): ReactElement {
  return (
    <Stack gap={3}>
      <Stagger.Item>
        <Surface
          level="card"
          pad={8}
          style={{ background: LILAC ? gradientCss(LILAC) : undefined }}
        >
          <Surface level="card" padX={6} padY={4}>
            <Text variant="title">Quarterly review</Text>
          </Surface>
        </Surface>
      </Stagger.Item>
      <Stagger.Item>
        <Surface level="section" padX={4} padY={3}>
          <Text variant="label">Theme · Lilac</Text>
        </Surface>
      </Stagger.Item>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Words and a visual",
    description:
      "Seven columns of words beside five of visual, stacked under 1024px of page. The visual's pieces assemble as it arrives.",
    render: () => (
      <Page>
        <SplitHero
          eyebrow="Deckhand"
          title="Decks that look designed."
          titleMore="Write the slides, pick a theme, and present from any screen."
          actions={
            <>
              <Button variant="primary" arrow="forward">
                Start a deck
              </Button>
              <Button variant="soft">See examples</Button>
            </>
          }
          visual={<Preview />}
        />
      </Page>
    ),
  },
  {
    title: "Tinted",
    description:
      "The band on bg-tint, a soft fill from the palettes, which the headline, its continuation and the body keep AA contrast on in both themes.",
    render: () => (
      <Page>
        <SplitHero
          variant="tinted"
          eyebrow="Deckhand"
          title="Decks that look designed."
          titleMore="Write the slides, pick a theme, and present from any screen."
          actions={
            <>
              <Button variant="primary" arrow="forward">
                Start a deck
              </Button>
              <Button variant="secondary">See examples</Button>
            </>
          }
          visual={<Preview />}
        />
      </Page>
    ),
  },
];
