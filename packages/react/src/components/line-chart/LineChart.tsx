import { cx } from "@buttery/core";
import type { ReactElement } from "react";
import { ChartFrame } from "../chart-frame/ChartFrame.tsx";
import type { ChartFrameProps } from "../chart-frame/ChartFrame.tsx";

/** Props for `LineChart`: the frame's, without its layout and marks. */
export type LineChartProps = Omit<
  ChartFrameProps,
  "children" | "layout" | "data-bt"
>;

/**
 * Values over time as smooth 2px lines that never bend past a value, a comparison series in `chart-muted`
 * beneath the rest, in a `ChartFrame`: gridlines, axis labels, a crosshair with a dot per series and a
 * tooltip that follow the pointer, arrow keys through the points, and a screen-reader table.
 *
 * @example
 * <LineChart
 *   label="Sales"
 *   labels={["Oct 8", "Oct 9", "Oct 10"]}
 *   series={[
 *     { key: "now", label: "This week", values: [1240, 1380, 1310] },
 *     { key: "before", label: "Last week", values: [1100, 1190, 1250], comparison: true },
 *   ]}
 * />
 */
export function LineChart({
  series,
  className,
  ...rest
}: LineChartProps): ReactElement {
  const drawn = [
    ...series.filter((entry) => entry.comparison === true),
    ...series.filter((entry) => entry.comparison !== true),
  ];
  return (
    <ChartFrame
      {...rest}
      series={series}
      className={cx("bt-line-chart", className)}
      data-bt="LineChart"
    >
      {drawn.map((entry) => (
        <ChartFrame.Line key={entry.key} series={entry.key} />
      ))}
    </ChartFrame>
  );
}
