import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, MorphMenu, NavBar } from "@butteryui/react";

/** A floating bar: its row a rounded surface inset from the page's top and sides, its sheet the same as ever. */
export function FloatingBar(): ReactElement {
  return (
    <NavBar
      variant="floating"
      brand={<a href="#home">Halfmoon Roastery</a>}
      actions={
        <Button asChild variant="primary" arrow="forward">
          <a href="#shop">Shop coffee</a>
        </Button>
      }
    >
      <MorphMenu.Item label="Coffee">
        <MorphMenu.Column title="Roasts">
          <MorphMenu.Entry
            href="#light"
            title="Light roasts"
            caption="Bright and fruity"
          />
          <MorphMenu.Entry
            href="#dark"
            title="Dark roasts"
            caption="Chocolate and spice"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Link href="#subscriptions">Subscriptions</MorphMenu.Link>
    </NavBar>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Menu");
  await see("Subscriptions");
  await see("Shop coffee");
};
