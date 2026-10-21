import type { ReactElement } from "react";
import { Button, MorphMenu, NavBar } from "@buttery/react";

/** A help site's bar: one menu, a link and a single call to action. */
export function HelpSite(): ReactElement {
  return (
    <NavBar
      brand={<a href="#help">Help</a>}
      actions={<Button variant="secondary">Contact us</Button>}
    >
      <MorphMenu.Item label="Topics">
        <MorphMenu.Column title="Popular">
          <MorphMenu.Entry
            href="#export"
            title="Exporting"
            caption="Sizes and formats"
          />
          <MorphMenu.Entry
            href="#account"
            title="Your account"
            caption="Billing and sign-in"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Link href="#status">Status</MorphMenu.Link>
    </NavBar>
  );
}
