import type { ReactElement } from "react";
import { Footer } from "@buttery/react";

/** Columns of links with nothing else: a help center's foot. */
export function LinksOnly(): ReactElement {
  return (
    <Footer>
      <Footer.Column title="Getting started">
        <Footer.Link href="#first-card">Your first card</Footer.Link>
        <Footer.Link href="#shortcuts">Shortcuts</Footer.Link>
      </Footer.Column>
      <Footer.Column title="Exporting">
        <Footer.Link href="#sizes">Sizes</Footer.Link>
        <Footer.Link href="#formats">PNG or JPG</Footer.Link>
      </Footer.Column>
    </Footer>
  );
}
