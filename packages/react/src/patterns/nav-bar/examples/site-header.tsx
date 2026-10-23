import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ArrowLink, Button, MorphMenu, NavBar, Page } from "@butteryui/react";

/** The top of a landing page: the brand, a menu with a story and a See all link, a plain link, and two calls to action over the opening. */
export function SiteHeader(): ReactElement {
  return (
    <Page>
      <NavBar
        brand={<a href="#top">Deckhand</a>}
        actions={
          <>
            <Button asChild variant="secondary">
              <a href="#sign-in">Sign in</a>
            </Button>
            <Button asChild variant="primary" arrow="forward">
              <a href="#get-started">Get started</a>
            </Button>
          </>
        }
      >
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
      </NavBar>
      <Stack gap={4} padX={8} padY={12}>
        <Text variant="display">Decks for every meeting</Text>
        <Text variant="body-lg">
          Written in an afternoon, ready for any screen.
        </Text>
      </Stack>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Menu");
  await press("button", "Product");
  await see("Layouts and notes");
  await see("The presenter view");
};
