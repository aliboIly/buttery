import type { ReactElement } from "react";
import { TextStack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** The copy of one onboarding step: a title, what it does, and a tip. */
export function StepCopy(): ReactElement {
  return (
    <TextStack
      title="Make it yours"
      body="Pick a backdrop, round the corners and add depth. Every change shows up right away."
      caption="Tip: hold Shift for finer steps."
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Make it yours");
  await see("Tip: hold Shift for finer steps.");
};
