import type { ReactElement } from "react";
import { TextStack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** The copy of one onboarding step: a title, what it does, and a tip. */
export function StepCopy(): ReactElement {
  return (
    <TextStack
      title="Make it yours"
      body="Pick a theme, choose a background and set the fonts. Every change shows up right away."
      caption="Tip: press T to try the next theme."
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Make it yours");
  await see("Tip: press T to try the next theme.");
};
