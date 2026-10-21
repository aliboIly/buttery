import type { ReactElement } from "react";
import { Sparkline } from "@buttery/react";

/** Refunds over two weeks in the rose chart color, with a gap for days with no data. */
export function RefundsTrend(): ReactElement {
  return (
    <Sparkline
      label="Refunds, last 14 days"
      values={[3, 1, 2, null, null, 2, 1, 0, 0, 1, 0, 0, 1, 0]}
      color="chart-5"
    />
  );
}
