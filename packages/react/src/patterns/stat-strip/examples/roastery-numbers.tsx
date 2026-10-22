import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Stat, StatStrip } from "@buttery/react";

/** Four numbers in equal columns, each counting up once as the strip comes into view. */
export function RoasteryNumbers(): ReactElement {
  return (
    <StatStrip>
      <Stat value={38} label="coffees on the menu" />
      <Stat value={12} label="origins this season" />
      <Stat value={2400} suffix="+" label="bags roasted a month" />
      <Stat value={98} suffix="%" label="of orders sent the same day" />
    </StatStrip>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("coffees on the menu");
  await see("of orders sent the same day");
};
