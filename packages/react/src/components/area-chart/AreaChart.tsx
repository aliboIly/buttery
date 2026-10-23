import { cx } from "@butteryui/core";
import type { ReactElement } from "react";
import { ChartFrame } from "../chart-frame/ChartFrame.tsx";
import type { ChartFrameProps } from "../chart-frame/ChartFrame.tsx";

/** Props for `AreaChart`: the frame's, without its layout and marks. */
export type AreaChartProps = Omit<
  ChartFrameProps,
  "children" | "layout" | "data-bt"
>;

/**
 * Values over time as lines with the area under each filled in its color at 12%, for totals that build up,
 * such as revenue. A comparison series is a `chart-muted` line without a fill. Hover, keyboard and the
 * screen-reader table work as in `LineChart`.
 *
 * @example
 * <AreaChart
 *   label="Subscription revenue"
 *   labels={["Jul", "Aug", "Sep", "Oct"]}
 *   series={[{ key: "revenue", label: "Revenue", values: [8200, 8900, 9400, 10100] }]}
 *   formatValue={(value) => `$${value.toLocaleString()}`}
 * />
 */
export function AreaChart({
  series,
  className,
  ...rest
}: AreaChartProps): ReactElement {
  const comparisons = series.filter((entry) => entry.comparison === true);
  const filled = series.filter((entry) => entry.comparison !== true);
  return (
    <ChartFrame
      {...rest}
      series={series}
      className={cx("bt-area-chart", className)}
      data-bt="AreaChart"
    >
      {filled.map((entry) => (
        <ChartFrame.Area key={entry.key} series={entry.key} />
      ))}
      {[...comparisons, ...filled].map((entry) => (
        <ChartFrame.Line key={entry.key} series={entry.key} />
      ))}
    </ChartFrame>
  );
}
