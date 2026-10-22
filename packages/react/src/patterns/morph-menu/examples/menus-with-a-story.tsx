import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink, MorphMenu } from "@buttery/react";

/** A site's menus in full: columns of links with captions, a story at the menu's end and a See all link under the columns. */
export function MenusWithAStory(): ReactElement {
  return (
    <Surface level="card" padX={4}>
      <MorphMenu label="Card Studio">
        <MorphMenu.Item
          label="Product"
          featured={
            <Stack gap={2}>
              <Text variant="control" tone="secondary">
                New
              </Text>
              <Text variant="title">The lean pad</Text>
              <Text variant="body-sm" tone="secondary">
                Turn the card toward you, up to 20 degrees.
              </Text>
            </Stack>
          }
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
          </MorphMenu.Column>
          <MorphMenu.Column title="Share">
            <MorphMenu.Entry
              href="#export"
              title="Export"
              caption="PNG or JPG at the canvas's size"
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
  await see("The lean pad");
  await see("See all features");
};
