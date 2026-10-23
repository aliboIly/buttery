import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink, MorphMenu } from "@buttery/react";

/** A site's menus in full: columns of links with captions, a story at the menu's end and a See all link under the columns. */
export function MenusWithAStory(): ReactElement {
  return (
    <Surface level="card" padX={4}>
      <MorphMenu label="Deckhand">
        <MorphMenu.Item
          label="Product"
          featured={
            <Stack gap={2}>
              <Text variant="control" tone="secondary">
                New
              </Text>
              <Text variant="title">The presenter view</Text>
              <Text variant="body-sm" tone="secondary">
                Notes and the next slide, on your screen only.
              </Text>
            </Stack>
          }
          footer={<ArrowLink href="#features">See all features</ArrowLink>}
        >
          <MorphMenu.Column title="Make">
            <MorphMenu.Entry
              href="#slides"
              title="Slides"
              caption="Layouts and notes"
            />
            <MorphMenu.Entry
              href="#themes"
              title="Themes"
              caption="Fonts and colors"
            />
          </MorphMenu.Column>
          <MorphMenu.Column title="Share">
            <MorphMenu.Entry
              href="#export"
              title="Export"
              caption="PDF or PNG files"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Item label="Guides">
          <MorphMenu.Column title="Learn">
            <MorphMenu.Entry
              href="#first-deck"
              title="Your first deck"
              caption="Ten minutes from blank to done"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
      </MorphMenu>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Product");
  await see("The presenter view");
  await see("See all features");
};
