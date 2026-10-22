import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink, Button, MorphMenu, NavBar, Page } from "@buttery/react";

/** The top of a landing page: the brand, a menu with a story and a See all link, a plain link, and two calls to action over the opening. */
export function SiteHeader(): ReactElement {
  return (
    <Page>
      <NavBar
        brand={<a href="#top">Card Studio</a>}
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
      </NavBar>
      <Stack gap={4} padX={8} padY={12}>
        <Text variant="display">Cards for launch days</Text>
        <Text variant="body-lg">Made in a minute, ready for every post.</Text>
      </Stack>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Menu");
  await press("button", "Product");
  await see("Titles, finishes and leans");
  await see("The lean pad");
};
