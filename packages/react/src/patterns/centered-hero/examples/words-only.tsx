import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { CenteredHero } from "@buttery/react";

/** A short page's opening band, words alone. */
export function WordsOnly(): ReactElement {
  return (
    <CenteredHero
      eyebrow="Changelog"
      title="What's new."
      titleMore="Everything that changed this month."
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Changelog");
  await see("Everything that changed this month.");
};
