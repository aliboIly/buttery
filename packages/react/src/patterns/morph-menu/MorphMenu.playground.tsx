import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { ArrowLink, MorphMenu } from "@buttery/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "MorphMenu",
  description:
    "A row of menu triggers whose menus open in one floating panel that reshapes from menu to menu instead of closing and reopening.",
  order: 40,
  status: "stable",
  since: "0.6.0",
};

function Story(): ReactElement {
  return (
    <Stack gap={2}>
      <Text variant="control" tone="secondary">
        New
      </Text>
      <Text variant="title">The lean pad</Text>
      <Text variant="body-sm" tone="secondary">
        Turn the card toward you, up to 20 degrees.
      </Text>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Menus in one panel",
    description:
      "Rest on a trigger for 150ms and its menu unfolds under the row in dur-fast. Move along the row and the panel reshapes on spring.snappy while the columns crossfade, the new ones sliding in from the side you came from. Leave and it folds up after 100ms.",
    render: () => (
      <Surface
        level="card"
        padX={4}
        style={{ minBlockSize: "calc(var(--bt-bento-row) * 1.25)" }}
      >
        <MorphMenu label="Demo menus">
          <MorphMenu.Item
            label="Product"
            featured={<Story />}
            footer={<ArrowLink href="#features">See all features</ArrowLink>}
          >
            <MorphMenu.Column title="Make">
              <MorphMenu.Entry
                href="#cards"
                title="Cards"
                caption="Titles, finishes and leans"
              />
              <MorphMenu.Entry
                href="#backdrops"
                title="Backdrops"
                caption="Blends, colors or your own picture"
              />
              <MorphMenu.Entry
                href="#sizes"
                title="Sizes"
                caption="Square to story, or your own"
              />
            </MorphMenu.Column>
            <MorphMenu.Column title="Share">
              <MorphMenu.Entry
                href="#export"
                title="Export"
                caption="PNG or JPG at the canvas's size"
              />
              <MorphMenu.Entry
                href="#copy"
                title="Copy"
                caption="On the clipboard, ready to paste"
              />
            </MorphMenu.Column>
          </MorphMenu.Item>
          <MorphMenu.Item label="Guides">
            <MorphMenu.Column title="Learn">
              <MorphMenu.Entry
                href="#first-card"
                title="Your first card"
                caption="Five minutes from blank to done"
              />
              <MorphMenu.Entry
                href="#shortcuts"
                title="Shortcuts"
                caption="Every key on one page"
              />
            </MorphMenu.Column>
          </MorphMenu.Item>
          <MorphMenu.Item label="Company">
            <MorphMenu.Column>
              <MorphMenu.Entry href="#about" title="About" />
              <MorphMenu.Entry href="#careers" title="Careers" />
              <MorphMenu.Entry href="#press" title="Press kit" />
            </MorphMenu.Column>
          </MorphMenu.Item>
          <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
        </MorphMenu>
      </Surface>
    ),
  },
];
