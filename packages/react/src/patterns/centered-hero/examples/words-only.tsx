import type { ReactElement } from "react";
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
