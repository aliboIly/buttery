import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Stat, StatStrip } from "@butteryui/react";

const dollars = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Two columns of numbers written your own way: a currency sign and compact figures. */
export function MoneyStat(): ReactElement {
  return (
    <StatStrip columns={2}>
      <Stat
        value={4200000}
        prefix="$"
        format={(value) => dollars.format(value)}
        label="paid to creators"
      />
      <Stat value={310} label="creators" />
    </StatStrip>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("paid to creators");
  await see("creators");
};
