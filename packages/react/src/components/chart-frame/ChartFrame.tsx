import { Text, cx, space, useMergedRefs, warnOnce } from "@buttery/core";
import type { ColorToken, CssVariables } from "@buttery/core";
import { ArrowDown, ArrowUp } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import {
  createContext,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";
import { LoadingPill } from "../loading-pill/LoadingPill.tsx";
import { StatusBadge } from "../status-badge/StatusBadge.tsx";
import { runs, seriesPath, smoothPath, valueScale } from "./chart-scale.ts";
import type { ValueScale } from "./chart-scale.ts";

/** A chart's height, axis labels included: `sm` 160, `md` 220 or `lg` 300px. */
export type ChartSize = "sm" | "md" | "lg";

/** A series' color: one of the chart tokens. */
export type ChartColor = Extract<ColorToken, `chart-${string}`>;

/**
 * Where a chart's points sit along its width: evenly from edge to edge (`"point"`, for lines), or each in
 * the middle of an equal slot (`"band"`, for bars).
 */
export type ChartLayout = "point" | "band";

/** One series of values over a chart's labels. */
export interface ChartSeries {
  /** Identifies the series among the chart's others, and marks name it. */
  readonly key: string;
  /** Its name in the tooltip and the screen-reader table, such as "This week". */
  readonly label: string;
  /** One value per label, in order; `null` where there isn't one, which leaves a gap. */
  readonly values: readonly (number | null)[];
  /** Its color. Defaults to `chart-1`, `chart-2` and on in order, or `chart-muted` for the comparison. */
  readonly color?: ChartColor | undefined;
  /**
   * Marks the series the others are measured against, such as the previous period: it's drawn in
   * `chart-muted` under the others, and the tooltip shows the first series' change from it.
   */
  readonly comparison?: boolean | undefined;
}

/** Props for `ChartFrame`. */
export interface ChartFrameProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** Names the chart for screen readers and captions its data table, such as "Total sales". */
  readonly label: string;
  /** One line on what the chart shows, read after its name, such as "Up 12% on last week". */
  readonly summary?: string | undefined;
  /** The text for each point along the bottom, such as dates; the first and last show under the plot, and three more at `lg`. */
  readonly labels: readonly string[];
  /** The series, each with one value per label. */
  readonly series: readonly ChartSeries[];
  /** Where points sit: `"point"` (the default) or `"band"`, which bars need. */
  readonly layout?: ChartLayout | undefined;
  /** Its height: `"sm"` 160, `"md"` 220 (the default) or `"lg"` 300px. */
  readonly size?: ChartSize | undefined;
  /** Writes a value for the tooltip and the table. Defaults to the number with up to two decimals. */
  readonly formatValue?: ((value: number) => string) | undefined;
  /** Writes a gridline's value at the end edge. Defaults to a short form, such as 1.2K. */
  readonly formatTick?: ((value: number) => string) | undefined;
  /** Shows a fall against the comparison as good news (`success`) and a rise as bad. Defaults to `false`. */
  readonly lowerIsBetter?: boolean | undefined;
  /** Shows a `LoadingPill` over the empty box in place of the plot. Defaults to `false`. */
  readonly loading?: boolean | undefined;
  /** What the loading pill says. Defaults to `"Loading data"`. */
  readonly loadingLabel?: string | undefined;
  /** What it says with no values to draw. Defaults to `"No data for this period"`. */
  readonly emptyLabel?: string | undefined;
  /** Heads the labels' column in the screen-reader table. Defaults to `"Date"`. */
  readonly labelsHeading?: string | undefined;
  /** The `data-bt` stamp, for charts built on the frame. Defaults to `"ChartFrame"`. */
  readonly "data-bt"?: string | undefined;
  /** The marks: `ChartFrame.Line`, `ChartFrame.Area` and `ChartFrame.Bars`, drawn in order. */
  readonly children?: ReactNode;
}

interface ResolvedSeries extends ChartSeries {
  readonly color: ChartColor;
}

interface ChartModel {
  readonly labels: readonly string[];
  readonly series: readonly ResolvedSeries[];
  readonly scale: ValueScale;
  readonly layout: ChartLayout;
}

type Trend = "rise" | "fall" | "flat";

const SERIES_COLORS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const satisfies readonly ChartColor[];

const plainNumber = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});
const shortNumbers = new Map<number, Intl.NumberFormat>();

/** Compact numbers ("2.5K") with as many decimals as the ticks need, at least one for the compact forms. */
function shortNumber(decimals: number): Intl.NumberFormat {
  const digits = Math.max(1, decimals);
  let format = shortNumbers.get(digits);
  if (format === undefined) {
    format = new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: digits,
    });
    shortNumbers.set(digits, format);
  }
  return format;
}
const signedPercent = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const ChartContext = createContext<ChartModel | null>(null);

function useChart(mark: string): ChartModel {
  const chart = use(ChartContext);
  if (chart === null)
    throw new Error(
      `ChartFrame.${mark} draws inside a chart. Fix: put it in a <ChartFrame>, or use LineChart, AreaChart or BarChart.`,
    );
  return chart;
}

function resolveSeries(series: readonly ChartSeries[]): ResolvedSeries[] {
  let next = 0;
  return series.map((entry) => {
    if (entry.color !== undefined) return { ...entry, color: entry.color };
    if (entry.comparison === true) return { ...entry, color: "chart-muted" };
    const color = SERIES_COLORS[next % SERIES_COLORS.length] ?? "chart-1";
    next += 1;
    return { ...entry, color };
  });
}

function seriesColor(color: ChartColor): CSSProperties & CssVariables {
  return { "--bt-chart-frame-series": `var(--bt-${color})` };
}

function valueAt(series: ChartSeries, index: number): number | null {
  return series.values[index] ?? null;
}

/** Where the point at `index` sits across the plot, from 0 at its start to 1 at its end. */
function xOf(chart: ChartModel, index: number): number {
  const count = chart.labels.length;
  if (chart.layout === "band") return (index + 0.5) / count;
  return count <= 1 ? 0.5 : index / (count - 1);
}

/** Where `value` sits down the plot, from 0 at its top to 1 at its bottom. */
function yOf(scale: ValueScale, value: number): number {
  return (scale.max - value) / (scale.max - scale.min);
}

function deltaAt(
  series: readonly ResolvedSeries[],
  index: number,
): number | undefined {
  const comparison = series.find((entry) => entry.comparison === true);
  const primary = series.find((entry) => entry.comparison !== true);
  if (comparison === undefined || primary === undefined) return undefined;
  const now = valueAt(primary, index);
  const then = valueAt(comparison, index);
  if (now === null || then === null || then === 0) return undefined;
  return (now - then) / Math.abs(then);
}

function trendOf(delta: number): Trend {
  if (Math.abs(delta) < 0.0005) return "flat";
  return delta > 0 ? "rise" : "fall";
}

/** Where a label under the plot sits: on its point, except that a band chart's end labels line up with its edges. */
function labelX(chart: ChartModel, index: number): number {
  const last = chart.labels.length - 1;
  if (chart.layout === "band" && index === 0 && last > 0) return 0;
  if (chart.layout === "band" && index === last && last > 0) return 1;
  return xOf(chart, index);
}

/** Indexes of the labels shown under the plot: the ends, and the quarters at `lg`. */
function axisLabels(count: number, size: ChartSize): number[] {
  if (count === 0) return [];
  const last = count - 1;
  const steps = size === "lg" ? [0, 0.25, 0.5, 0.75, 1] : [0, 1];
  return [...new Set(steps.map((step) => Math.round(step * last)))];
}

function percentOf(fraction: number): string {
  return `${String(Math.round(fraction * 10000) / 100)}%`;
}

function ChartFrameRoot({
  label,
  summary,
  labels,
  series,
  layout = "point",
  size = "md",
  formatValue = (value) => plainNumber.format(value),
  formatTick,
  lowerIsBetter = false,
  loading = false,
  loadingLabel = "Loading data",
  emptyLabel = "No data for this period",
  labelsHeading = "Date",
  className,
  style,
  children,
  ref,
  onAnimationEnd,
  ...rest
}: ChartFrameProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);

  if (loading !== wasLoading) {
    setWasLoading(loading);
    setArrived(!loading);
  }
  const rootRefs = useMergedRefs(ref, root);
  const plot = useRef<HTMLDivElement>(null);
  const shown = useRef<number | null>(null);
  const position = useRef<number | null>(null);
  const summaryId = useId();
  const resolved = resolveSeries(series);
  const scale = valueScale(
    resolved.flatMap((entry) => entry.values.filter((value) => value !== null)),
    size === "lg" ? 5 : 4,
  );
  const chart: ChartModel = { labels, series: resolved, scale, layout };
  const count = labels.length;
  const last = count - 1;
  const empty =
    count === 0 ||
    resolved.every((entry) => entry.values.every((value) => value === null));
  const state = loading ? "loading" : empty ? "empty" : "ready";
  const ticks = [...scale.ticks].reverse();
  const tickText =
    formatTick ??
    ((value: number) => shortNumber(scale.decimals).format(value));
  const frameStyle: CSSProperties & CssVariables = {
    ...style,
    "--bt-chart-frame-bands": String(Math.max(1, count)),
  };

  useEffect(() => {
    if (loading) return;
    const uneven = series.find(
      (entry) => entry.values.length > 0 && entry.values.length !== count,
    );
    if (uneven === undefined) return;
    warnOnce(
      "ChartFrame",
      `The "${label}" chart's series "${uneven.key}" has ${String(uneven.values.length)} values for ${String(count)} labels. Fix: give each series one value per label, with null where there's none.`,
    );
  }, [series, count, label, loading]);

  const describe = (index: number): string => {
    const values = resolved.flatMap((entry) => {
      const value = valueAt(entry, index);
      return value === null ? [] : [`${entry.label} ${formatValue(value)}`];
    });
    const delta = deltaAt(resolved, index);
    return [
      `${labels[index] ?? ""}: ${values.join(", ")}`,
      ...(delta === undefined ? [] : [signedPercent.format(delta)]),
    ].join(", ");
  };

  const nearest = (clientX: number): number => {
    const box = plot.current?.getBoundingClientRect();
    if (box === undefined || box.width === 0) return last;
    const fraction = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    return layout === "band"
      ? Math.min(last, Math.floor(fraction * count))
      : Math.round(fraction * last);
  };

  const show = (index: number): void => {
    const frame = root.current;
    const area = plot.current;
    if (frame === null || area === null) return;
    shown.current = index;
    const box = area.getBoundingClientRect();
    const bounds = frame.getBoundingClientRect();
    const x = xOf(chart, index) * box.width;
    const marker = frame.querySelector<HTMLElement>(
      '[data-bt-part="crosshair"], [data-bt-part="column"]',
    );
    if (marker !== null) {
      marker.hidden = false;
      marker.style.translate =
        layout === "band"
          ? `${String((index / count) * box.width)}px 0`
          : `calc(${String(x)}px - 50%) 0`;
    }
    const points = frame.querySelectorAll<HTMLElement>(
      '[data-bt-part="point"]',
    );
    const values = frame.querySelectorAll<HTMLElement>(
      '[data-bt-part="tooltip-value"]',
    );
    resolved.forEach((entry, at) => {
      const value = valueAt(entry, index);
      const point = points[at];
      if (point !== undefined) {
        point.hidden = value === null;
        if (value !== null)
          point.style.translate = `calc(${String(x)}px - 50%) calc(${String(yOf(scale, value) * box.height)}px - 50%)`;
      }
      const cell = values[at];
      if (cell !== undefined)
        cell.textContent = value === null ? "—" : formatValue(value);
    });
    const date = frame.querySelector('[data-bt-part="tooltip-date"]');
    if (date !== null) date.textContent = labels[index] ?? "";
    const delta = deltaAt(resolved, index);
    const trend = delta === undefined ? undefined : trendOf(delta);
    for (const badge of frame.querySelectorAll<HTMLElement>(
      '[data-bt-part="tooltip-delta"]',
    )) {
      badge.hidden = badge.dataset["trend"] !== trend;
      const text = badge.querySelector('[data-bt-part="delta-text"]');
      if (!badge.hidden && text !== null && delta !== undefined)
        text.textContent = signedPercent.format(delta);
    }
    const tooltip = frame.querySelector<HTMLElement>(
      '[data-bt-part="tooltip"]',
    );
    if (tooltip === null) return;
    tooltip.hidden = false;
    const width = tooltip.offsetWidth;
    const reach = layout === "band" ? box.width / count / 2 : 0;
    const at = box.left - bounds.left + x;
    const gap = space["2"];
    let left = at + reach + gap;
    if (left + width > bounds.width) left = at - reach - gap - width;
    if (left < 0)
      left = Math.max(0, Math.min(bounds.width - width, at + reach + gap));
    tooltip.style.translate = `${String(left)}px 0`;
  };

  const hide = (): void => {
    const frame = root.current;
    if (frame === null) return;
    shown.current = null;
    for (const part of frame.querySelectorAll<HTMLElement>(
      '[data-bt-part="crosshair"], [data-bt-part="column"], [data-bt-part="point"], [data-bt-part="tooltip"]',
    ))
      part.hidden = true;
  };

  const step = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape" && shown.current !== null) {
      event.stopPropagation();
      hide();
      return;
    }
    const from = shown.current ?? position.current ?? last;
    const next =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? Math.max(0, from - 1)
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? Math.min(last, from + 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    position.current = next;
    event.currentTarget.setAttribute("aria-valuenow", String(next));
    event.currentTarget.setAttribute("aria-valuetext", describe(next));
    show(next);
  };

  // The slider's value and the shown point are written straight to the page, so after every render they're
  // written again for the data as it is now, kept inside its points.
  useLayoutEffect(() => {
    const area = plot.current;
    if (area === null) {
      shown.current = null;
      return;
    }
    const at = Math.min(last, Math.max(0, position.current ?? last));
    area.setAttribute("aria-valuenow", String(at));
    area.setAttribute("aria-valuetext", describe(at));
    if (shown.current !== null) show(Math.min(last, shown.current));
  });

  const trendBadge = (trend: Trend): ReactElement => {
    const good = trend === "rise" ? !lowerIsBetter : lowerIsBetter;
    return (
      <StatusBadge
        key={trend}
        tone={trend === "flat" ? "neutral" : good ? "success" : "danger"}
        icon={
          trend === "rise" ? ArrowUp : trend === "fall" ? ArrowDown : undefined
        }
        data-bt-part="tooltip-delta"
        data-trend={trend}
        hidden
      >
        <span data-bt-part="delta-text" />
      </StatusBadge>
    );
  };

  return (
    <div
      data-bt="ChartFrame"
      {...rest}
      ref={rootRefs}
      className={cx("bt-chart-frame", className)}
      data-size={size}
      data-layout={layout}
      data-state={state}
      data-arrived={arrived && state === "ready" ? "" : undefined}
      aria-busy={loading ? true : undefined}
      style={frameStyle}
      onAnimationEnd={(event) => {
        onAnimationEnd?.(event);
        if (event.animationName === "bt-chart-frame-arrive") setArrived(false);
      }}
    >
      {state === "ready" ? (
        <>
          <div data-bt-part="y-axis" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick}>{tickText(tick)}</span>
            ))}
          </div>
          <div
            ref={plot}
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-describedby={summary === undefined ? undefined : summaryId}
            aria-valuemin={0}
            aria-valuemax={last}
            aria-valuenow={last}
            className="bt-focus"
            data-bt-part="plot"
            onPointerMove={(event) => {
              const index = nearest(event.clientX);
              if (index !== shown.current) show(index);
            }}
            onPointerDown={(event) => {
              show(nearest(event.clientX));
            }}
            onPointerLeave={hide}
            onKeyDown={step}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible"))
                show(position.current ?? last);
            }}
            onBlur={hide}
          >
            <div data-bt-part="grid">
              {ticks.map((tick) => (
                <span key={tick} />
              ))}
            </div>
            {layout === "band" ? (
              <span data-bt-part="column" hidden />
            ) : (
              <span data-bt-part="crosshair" hidden />
            )}
            <ChartContext value={chart}>{children}</ChartContext>
            {layout === "point"
              ? resolved.map((entry) => (
                  <span
                    key={entry.key}
                    data-bt-part="point"
                    style={seriesColor(entry.color)}
                    hidden
                  />
                ))
              : null}
          </div>
          <div data-bt-part="x-axis" aria-hidden="true">
            {axisLabels(count, size).map((index) => (
              <span
                key={index}
                data-edge={
                  last === 0
                    ? undefined
                    : index === 0
                      ? "start"
                      : index === last
                        ? "end"
                        : undefined
                }
                style={{ left: percentOf(labelX(chart, index)) }}
              >
                {labels[index]}
              </span>
            ))}
          </div>
          <div data-bt-part="tooltip" aria-hidden="true" hidden>
            <div data-bt-part="tooltip-head">
              <Text variant="caption" data-bt-part="tooltip-date" />
              {(["rise", "fall", "flat"] as const).map(trendBadge)}
            </div>
            {resolved.map((entry) => (
              <div key={entry.key} data-bt-part="tooltip-row">
                <span data-bt-part="swatch" style={seriesColor(entry.color)} />
                <Text variant="body-sm" asChild>
                  <span>{entry.label}</span>
                </Text>
                <Text tabular data-bt-part="tooltip-value" />
              </div>
            ))}
          </div>
          {summary === undefined ? null : (
            <VisuallyHidden.Root id={summaryId}>{summary}</VisuallyHidden.Root>
          )}
          <VisuallyHidden.Root>
            <table>
              <caption>{label}</caption>
              <thead>
                <tr>
                  <th scope="col">{labelsHeading}</th>
                  {resolved.map((entry) => (
                    <th key={entry.key} scope="col">
                      {entry.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((text, index) => (
                  <tr key={index}>
                    <th scope="row">{text}</th>
                    {resolved.map((entry) => {
                      const value = valueAt(entry, index);
                      return (
                        <td key={entry.key}>
                          {value === null ? "" : formatValue(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </VisuallyHidden.Root>
        </>
      ) : null}
      {state === "empty" ? (
        <div
          role="img"
          aria-label={`${label}: ${emptyLabel}`}
          data-bt-part="empty"
        >
          <Text variant="caption">{emptyLabel}</Text>
        </div>
      ) : null}
      <div data-bt-part="loading">
        <LoadingPill label={loadingLabel} loading={loading} />
      </div>
    </div>
  );
}

/** Props for `ChartFrame.Line` and `ChartFrame.Area`. */
export interface ChartMarkProps {
  /** The `key` of the series it draws. */
  readonly series: string;
}

function useSeries(
  mark: string,
  key: string,
): {
  readonly chart: ChartModel;
  readonly entry: ResolvedSeries | undefined;
} {
  const chart = useChart(mark);
  return { chart, entry: chart.series.find((item) => item.key === key) };
}

/** A series drawn as a 2px line with round joins, smoothed without ever bending past a value; gaps stay open. */
export function ChartLine({ series }: ChartMarkProps): ReactElement | null {
  const { chart, entry } = useSeries("Line", series);
  if (entry === undefined) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      data-bt-part="mark"
      style={seriesColor(entry.color)}
    >
      <path
        d={seriesPath(entry.values, {
          x: (index) => xOf(chart, index) * 100,
          y: (value) => yOf(chart.scale, value) * 100,
        })}
        data-bt-part="line"
      />
    </svg>
  );
}

/** A series' area: its line's shape filled down to zero in the series color at 12%. */
export function ChartArea({ series }: ChartMarkProps): ReactElement | null {
  const { chart, entry } = useSeries("Area", series);
  if (entry === undefined) return null;
  const zero = String(yOf(chart.scale, 0) * 100);
  const shapes = runs(entry.values).map((run) => {
    const first = run[0];
    const final = run.at(-1);
    if (first === undefined || final === undefined) return "";
    const line = smoothPath(
      run.map(({ index, value }) => ({
        x: xOf(chart, index) * 100,
        y: yOf(chart.scale, value) * 100,
      })),
    );
    return `${line}L${String(xOf(chart, final.index) * 100)} ${zero}L${String(xOf(chart, first.index) * 100)} ${zero}Z`;
  });
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      data-bt-part="mark"
      style={seriesColor(entry.color)}
    >
      <path d={shapes.join("")} data-bt-part="area" />
    </svg>
  );
}

/** Props for `ChartFrame.Bars`. */
export interface ChartBarsProps {
  /** The `key`s of the series it draws, side by side in each slot. Defaults to every series. */
  readonly series?: readonly string[] | undefined;
}

/**
 * Series drawn as bars, one slot per label with the series side by side in it, 4px apart and rounded 4px
 * at the end away from zero. Needs the frame's `layout="band"`.
 */
export function ChartBars({ series }: ChartBarsProps): ReactElement {
  const chart = useChart("Bars");
  const drawn =
    series === undefined
      ? chart.series
      : chart.series.filter((entry) => series.includes(entry.key));
  const zero = yOf(chart.scale, 0);
  return (
    <div aria-hidden="true" data-bt-part="bars">
      {chart.labels.map((_, index) => (
        <div key={index} data-bt-part="band">
          {drawn.map((entry) => {
            const value = valueAt(entry, index);
            return (
              <span key={entry.key} data-bt-part="bar-slot">
                {value === null ? null : (
                  <span
                    data-bt-part="bar"
                    data-negative={value < 0 ? "" : undefined}
                    style={{
                      ...seriesColor(entry.color),
                      top: percentOf(Math.min(zero, yOf(chart.scale, value))),
                      bottom: percentOf(
                        1 - Math.max(zero, yOf(chart.scale, value)),
                      ),
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** `ChartFrame` with its marks. */
export interface ChartFrameComponent {
  (props: ChartFrameProps): ReactElement;
  /** A series as a line. */
  readonly Line: typeof ChartLine;
  /** A series as a filled area under its line. */
  readonly Area: typeof ChartArea;
  /** Series as bars, in a `layout="band"` frame. */
  readonly Bars: typeof ChartBars;
}

/**
 * The frame buttery's charts are drawn in, at a fixed height that fills its container's width: gridlines at
 * round values with their labels at the end edge, the first and last labels along the bottom, and the marks
 * you put inside. Pointing at the plot snaps a crosshair (a column for bars) and a dot per series to the
 * nearest point, with a tooltip beside them that flips at the edge; the plot is one Tab stop whose arrow
 * keys, Home and End step through the points as a slider, and a visually hidden table holds the data.
 * Use `LineChart`, `AreaChart` or `BarChart` unless you're combining marks.
 *
 * @example
 * <ChartFrame label="Orders and revenue" labels={days} series={[orders, revenue]} layout="band">
 *   <ChartFrame.Bars series={["orders"]} />
 *   <ChartFrame.Line series="revenue" />
 * </ChartFrame>
 */
export const ChartFrame: ChartFrameComponent = Object.assign(ChartFrameRoot, {
  Line: ChartLine,
  Area: ChartArea,
  Bars: ChartBars,
});
