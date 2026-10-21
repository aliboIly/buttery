import type { ReactElement } from "react";
import { Button, MorphMenu, NavBar } from "@buttery/react";

/** A bar of plain links with no menus. */
export function LinksOnly(): ReactElement {
  return (
    <NavBar
      brand={<a href="#home">Card Studio</a>}
      actions={
        <Button variant="primary" arrow="forward">
          Get started
        </Button>
      }
    >
      <MorphMenu.Link href="#features">Features</MorphMenu.Link>
      <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
      <MorphMenu.Link href="#blog">Blog</MorphMenu.Link>
    </NavBar>
  );
}
