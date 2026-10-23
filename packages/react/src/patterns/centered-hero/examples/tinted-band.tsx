import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, CenteredHero } from "@butteryui/react";

/** A closing band on the palette tint, its headline an h2 under the page's own h1. */
export function TintedBand(): ReactElement {
  return (
    <CenteredHero
      variant="tinted"
      titleAs="h2"
      title="Your next deck."
      titleMore="Ready before the meeting starts."
      actions={
        <Button asChild variant="primary" arrow="forward">
          <a href="#new-deck">Start a deck</a>
        </Button>
      }
    />
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Your next deck.");
  await see("Start a deck");
};
