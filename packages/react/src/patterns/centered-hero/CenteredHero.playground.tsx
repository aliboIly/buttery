import { Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { Button, CenteredHero, Page } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "CenteredHero",
  description:
    "A page's opening band: a centered two-tone headline, a line and actions above a full-width visual that assembles.",
  order: 160,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Words over a wide visual",
    description:
      "The words are centered on at most 8 of 12 columns; the visual takes the column's width under them.",
    render: () => (
      <Page>
        <CenteredHero
          title="One deck."
          titleMore="Every screen it plays on."
          body="Wide for a talk, square for a post, tall for a phone."
          actions={
            <Button variant="primary" arrow="forward">
              Start a deck
            </Button>
          }
          visual={
            <Surface level="section" pad={12}>
              <Text variant="title">Your title slide here</Text>
            </Surface>
          }
        />
      </Page>
    ),
  },
  {
    title: "Tinted",
    description:
      "The band on bg-tint, a soft fill from the palettes, which the words keep AA contrast on in both themes: here a closing band with an h2.",
    render: () => (
      <Page>
        <CenteredHero
          variant="tinted"
          titleAs="h2"
          title="Your next deck."
          titleMore="Ready before the meeting starts."
          body="Pick a theme, write the slides and share a link."
          actions={
            <>
              <Button variant="primary" arrow="forward">
                Start a deck
              </Button>
              <Button variant="secondary">Talk to us</Button>
            </>
          }
        />
      </Page>
    ),
  },
];
