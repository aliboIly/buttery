import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, MorphMenu, NavBar } from "@buttery/react";

/** A bar of plain links with no menus, and a call to action with the forward arrow. */
export function LinksOnly(): ReactElement {
  return (
    <NavBar
      brand={<a href="#home">Card Studio</a>}
      actions={
        <Button asChild variant="primary" arrow="forward">
          <a href="#get-started">Get started</a>
        </Button>
      }
    >
      <MorphMenu.Link href="#features">Features</MorphMenu.Link>
      <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
      <MorphMenu.Link href="#blog">Blog</MorphMenu.Link>
    </NavBar>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Menu");
  await see("Pricing");
  await see("Get started");
};
