import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Stat, StatStrip } from "@buttery/react";

/** Four numbers in equal columns, each counting up once as the strip comes into view. */
export function RoasteryNumbers(): ReactElement {
  return (
    <StatStrip>
      <Stat value={38} label="templates to start from" />
      <Stat value={12} label="slide layouts" />
      <Stat value={2400} suffix="+" label="decks presented a day" />
      <Stat value={98} suffix="%" label="of exports ready in a second" />
    </StatStrip>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("templates to start from");
  await see("of exports ready in a second");
};
