import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Pane } from "../Pane.tsx";

/** A pane of notes docked beside the page. */
export function NotesPane(): ReactElement {
  return <Pane>Notes</Pane>;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Notes");
};
