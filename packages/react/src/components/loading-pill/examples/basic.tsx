import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { LoadingPill } from "@buttery/react";

/** A pill on its own: loading is true by default, and it shows once that has lasted 300ms. */
export function BasicLoadingPill(): ReactElement {
  return <LoadingPill label="Loading payouts" />;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Loading payouts");
};
