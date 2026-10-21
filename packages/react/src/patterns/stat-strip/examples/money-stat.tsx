import type { ReactElement } from "react";
import { Stat, StatStrip } from "@buttery/react";

const dollars = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Numbers written your own way: a currency sign and compact figures. */
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
