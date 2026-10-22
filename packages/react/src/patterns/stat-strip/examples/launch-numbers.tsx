import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Section, Stat, StatStrip } from "@buttery/react";

/** A band of four numbers on a launch page. */
export function LaunchNumbers(): ReactElement {
  return (
    <Section size="sm" title="Made every day">
      <StatStrip>
        <Stat value={1.2} suffix="M+" label="cards exported" />
        <Stat value={48} label="countries" />
        <Stat value={99.9} suffix="%" label="of exports under a second" />
        <Stat value={6} label="canvas shapes" />
      </StatStrip>
    </Section>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Made every day");
  await see("cards exported");
};
