import type { ReactElement } from "react";
import { Stack, Stagger, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Button, Page, SplitHero } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "SplitHero",
  description:
    "A page's opening band: a two-tone headline, a line and actions beside a visual that assembles as it arrives.",
  order: 310,
  status: "stable",
  since: "0.6.0",
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
            <Text variant="title">Launch card</Text>
          </Surface>
        </Surface>
      </Stagger.Item>
      <Stagger.Item>
        <Surface level="section" padX={4} padY={3}>
          <Text variant="label">Finish · Ink</Text>
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
          eyebrow="Card Studio"
          title="Cards that look finished."
          titleMore="Write a title, pick a finish, and send it out at any size."
          actions={
            <>
              <Button variant="primary" arrow="forward">
                Open the studio
              </Button>
              <Button variant="soft">See examples</Button>
            </>
          }
          visual={<Preview />}
        />
      </Page>
    ),
  },
];
