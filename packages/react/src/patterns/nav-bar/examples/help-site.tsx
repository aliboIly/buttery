import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, MorphMenu, NavBar } from "@butteryui/react";

/** A help site's bar: one menu, a link and a single call to action, folding into the Menu button on a narrow page. */
export function HelpSite(): ReactElement {
  return (
    <NavBar
      brand={<a href="#help">Help</a>}
      actions={
        <Button asChild variant="secondary">
          <a href="#contact">Contact us</a>
        </Button>
      }
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Menu");
  await press("button", "Topics");
  await see("Sizes and formats");
};
