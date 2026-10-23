import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Stat, StatStrip } from "@butteryui/react";

/** A roastery's year in numbers, large, each on a card of its own. */
export function NumbersOnCards(): ReactElement {
  return (
    <StatStrip layout="cards" size="lg">
      <Stat value={312} label="cafés we roast for" />
      <Stat value={18} label="farms we buy from" />
      <Stat value={4.9} label="average review" />
      <Stat
        value={92}
        suffix="%"
        label="of bags shipped the day they're roasted"
      />
    </StatStrip>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("cafés we roast for");
  await see("of bags shipped the day they're roasted");
};
