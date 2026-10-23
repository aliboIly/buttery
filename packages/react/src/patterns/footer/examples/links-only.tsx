import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Footer } from "@butteryui/react";

/** Columns of links with nothing else: a help center's foot. */
export function LinksOnly(): ReactElement {
  return (
    <Footer>
      <Footer.Column title="Getting started">
        <Footer.Link href="#first-deck">Your first deck</Footer.Link>
        <Footer.Link href="#shortcuts">Shortcuts</Footer.Link>
      </Footer.Column>
      <Footer.Column title="Exporting">
        <Footer.Link href="#sizes">Sizes</Footer.Link>
        <Footer.Link href="#formats">PDF or PNG</Footer.Link>
      </Footer.Column>
    </Footer>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Getting started");
  await see("Your first deck");
  await see("PDF or PNG");
};
