import { cx } from "@buttery/core";
import type { CssVariables } from "@buttery/core";
import type { ComponentPropsWithRef, CSSProperties, ReactElement } from "react";
import type { ChartColor } from "../chart-frame/ChartFrame.tsx";
import { seriesPath } from "../chart-frame/chart-scale.ts";

/** Props for `Sparkline`. */
export interface SparklineProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** Names the trend for screen readers, such as "Orders, last 30 days". */
  readonly label: string;
  /** The values, oldest first; `null`, or a value that isn't a finite number, leaves a gap. */
  readonly values: readonly (number | null)[];
  /** Its color. Defaults to `chart-1`. */
  readonly color?: ChartColor | undefined;
}

/** A spot along one side of the line's box, which sits inside the sparkline's padding. */
function inset(fraction: number): string {
  return `calc(var(--bt-sparkline-inset) + (100% - 2 * var(--bt-sparkline-inset)) * ${String(Math.round(fraction * 10000) / 10000)})`;
}

/**
 * A trend at a glance: a 2px line 24px tall that fills its container's width, drawn smooth from its lowest
 * value to its highest, with no axes and its last value marked by a dot. It's an image named by `label`;
 * put the numbers it summarizes beside it in text.
 *
 * @example
 * <Sparkline label="Orders, last 14 days" values={[42, 38, 51, 47, 63, 71, 58]} />
 */
export function Sparkline({
  label,
  values: given,
  color = "chart-1",
  className,
  style,
  ...rest
}: SparklineProps): ReactElement {
  const values = given.map((value) =>
    value !== null && Number.isFinite(value) ? value : null,
  );
  const known = values.filter((value) => value !== null);
  const low = Math.min(...known);
  const high = Math.max(...known);
  const x = (index: number): number =>
    values.length <= 1 ? 0.5 : index / (values.length - 1);
  const y = (value: number): number =>
    high === low ? 0.5 : (high - value) / (high - low);
  const lastIndex = values.findLastIndex((value) => value !== null);
  const lastValue = values[lastIndex] ?? null;
  const tint: CSSProperties & CssVariables = {
    ...style,
    "--bt-sparkline-color": `var(--bt-${color})`,
  };
  return (
    <span
      role="img"
      aria-label={label}
      {...rest}
      className={cx("bt-sparkline", className)}
      data-bt="Sparkline"
      style={tint}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={seriesPath(values, {
            x: (index) => x(index) * 100,
            y: (value) => y(value) * 100,
          })}
        />
      </svg>
      {lastValue === null ? null : (
        <span
          data-bt-part="dot"
          style={{ left: inset(x(lastIndex)), top: inset(y(lastValue)) }}
        />
      )}
    </span>
  );
}
