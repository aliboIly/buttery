import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { BrandMark, Button, MorphMenu, NavBar } from "@buttery/react";

/** A docs header whose home link is the mark beside buttery's name, the name saying what the mark shows. */
export function DocsHeader(): ReactElement {
  return (
    <NavBar
      brand={
        <a href="#home">
          <BrandMark size={24} />
          buttery
        </a>
      }
      actions={
        <Button variant="primary" arrow="forward">
          Get started
        </Button>
      }
    >
      <MorphMenu.Link href="#components">Components</MorphMenu.Link>
      <MorphMenu.Link href="#guides">Guides</MorphMenu.Link>
    </NavBar>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("buttery");
};
