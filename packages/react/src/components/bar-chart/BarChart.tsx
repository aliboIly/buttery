import { cx } from "@butteryui/core";
import type { ReactElement } from "react";
import { ChartFrame } from "../chart-frame/ChartFrame.tsx";
import type { ChartFrameProps } from "../chart-frame/ChartFrame.tsx";

/** Props for `BarChart`: the frame's, without its layout and marks. */
export type BarChartProps = Omit<
  ChartFrameProps,
  "children" | "layout" | "data-bt"
>;

/**
 * Values per period or category as bars, one slot per label with each series side by side in it, 4px
 * apart and rounded at the end away from zero. Pointing at a slot highlights its column and shows the
 * tooltip; arrow keys step through the slots, and a screen-reader table holds the values.
 *
 * @example
 * <BarChart
 *   label="Bags roasted"
 *   labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
 *   series={[{ key: "bags", label: "Bags", values: [48, 40, 55, 52, 60] }]}
 * />
 */
export function BarChart({ className, ...rest }: BarChartProps): ReactElement {
  return (
    <ChartFrame
      {...rest}
      layout="band"
      className={cx("bt-bar-chart", className)}
      data-bt="BarChart"
    >
      <ChartFrame.Bars />
    </ChartFrame>
  );
}
