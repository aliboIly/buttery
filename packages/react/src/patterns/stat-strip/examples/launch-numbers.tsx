import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Section, Stat, StatStrip } from "@buttery/react";

/** A band of four numbers on a launch page. */
export function LaunchNumbers(): ReactElement {
  return (
    <Section size="sm" title="Presented every day">
      <StatStrip>
        <Stat value={1.2} suffix="M+" label="decks presented" />
        <Stat value={48} label="countries" />
        <Stat value={99.9} suffix="%" label="of exports under a second" />
        <Stat value={6} label="slide sizes" />
      </StatStrip>
    </Section>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Presented every day");
  await see("decks presented");
};
