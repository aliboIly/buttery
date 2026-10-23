import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A stray on its own. */
export function Stray(): ReactElement {
  return <span>Stray</span>;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Stray");
};
