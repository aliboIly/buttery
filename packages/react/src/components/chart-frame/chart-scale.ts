/** A value axis: its ends and the ticks between them, evenly spaced from `min` to `max`. */
export interface ValueScale {
  /** The value at the bottom of the plot. */
  readonly min: number;
  /** The value at the top of the plot. */
  readonly max: number;
  /** The gridline values from `min` to `max`, ascending. */
  readonly ticks: readonly number[];
  /** How many decimal places the ticks need to read as what they are, such as 2 for steps of 0.25. */
  readonly decimals: number;
}

const NICE_STEPS = [1, 2, 2.5, 5, 10] as const;
const WHOLE_STEPS = [1, 2, 5, 10] as const;

function niceStep(rough: number, whole: boolean): number {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const steps: readonly number[] = whole ? WHOLE_STEPS : NICE_STEPS;
  const step = steps.find((candidate) => residual <= candidate) ?? 10;
  return step * magnitude;
}

function places(step: number): number {
  for (let digits = 0; digits < 8; digits += 1) {
    const scaled = step * 10 ** digits;
    if (Math.abs(Math.round(scaled) - scaled) < 1e-9) return digits;
  }
  return 8;
}

/**
 * A value axis that always takes in zero and lands on round numbers, with about `intervals` gaps between
 * its ticks; whole-number values, such as counts, get whole-number ticks, in steps of 1, 2 or 5 times a
 * power of ten. Values that are all zero, or none, give a single tick at zero on the plot's bottom edge.
 * Values that aren't finite numbers are left out.
 */
export function valueScale(
  values: Iterable<number>,
  intervals: number,
): ValueScale {
  let low = 0;
  let high = 0;
  let whole = true;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    low = Math.min(low, value);
    high = Math.max(high, value);
    whole &&= Number.isInteger(value);
  }
  if (low === high) return { min: 0, max: 1, ticks: [0], decimals: 0 };
  const fine = niceStep((high - low) / intervals, whole);
  const step = whole ? Math.max(1, fine) : fine;
  const decimals = places(step);
  const min = Math.floor(low / step) * step;
  const max = Math.ceil(high / step) * step;
  const count = Math.round((max - min) / step);
  const ticks = Array.from({ length: count + 1 }, (_, index) =>
    Number((min + index * step).toFixed(decimals)),
  );
  return {
    min: ticks[0] ?? min,
    max: ticks.at(-1) ?? max,
    ticks,
    decimals,
  };
}

/** A point in the plot's 100 × 100 drawing space. */
export interface PlotPoint {
  /** Across, from 0 at the start to 100 at the end. */
  readonly x: number;
  /** Down, from 0 at the top to 100 at the bottom. */
  readonly y: number;
}

function round(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function sign(value: number): number {
  return value < 0 ? -1 : value > 0 ? 1 : 0;
}

/** The slope at the middle point that keeps the curve from overshooting either neighbor (Steffen, 1990). */
function innerSlope(
  before: PlotPoint,
  at: PlotPoint,
  after: PlotPoint,
): number {
  const left = at.x - before.x;
  const right = after.x - at.x;
  const slopeLeft = (at.y - before.y) / left;
  const slopeRight = (after.y - at.y) / right;
  const blended = (slopeLeft * right + slopeRight * left) / (left + right);
  return (
    (sign(slopeLeft) + sign(slopeRight)) *
    Math.min(Math.abs(slopeLeft), Math.abs(slopeRight), 0.5 * Math.abs(blended))
  );
}

function endSlope(from: PlotPoint, to: PlotPoint, inner: number): number {
  const width = to.x - from.x;
  return width === 0 ? inner : (3 * ((to.y - from.y) / width) - inner) / 2;
}

/**
 * A smooth path through the points that never bends past any of them, so a run of equal values stays flat
 * and a peak is the highest point drawn. One or two points give a straight path.
 */
export function smoothPath(points: readonly PlotPoint[]): string {
  const first = points[0];
  if (first === undefined) return "";
  const start = `M${round(first.x)} ${round(first.y)}`;
  const second = points[1];
  if (second === undefined) return start;
  if (points.length === 2)
    return `${start}L${round(second.x)} ${round(second.y)}`;
  const slopes = points.map((point, index) => {
    const before = points[index - 1];
    const after = points[index + 1];
    return before === undefined || after === undefined
      ? 0
      : innerSlope(before, point, after);
  });
  const last = points.length - 1;
  const beforeLast = points[last - 1];
  const lastPoint = points[last];
  slopes[0] = endSlope(first, second, slopes[1] ?? 0);
  if (beforeLast !== undefined && lastPoint !== undefined)
    slopes[last] = endSlope(beforeLast, lastPoint, slopes[last - 1] ?? 0);
  let path = start;
  for (let index = 0; index < last; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    if (from === undefined || to === undefined) continue;
    const third = (to.x - from.x) / 3;
    const fromSlope = slopes[index] ?? 0;
    const toSlope = slopes[index + 1] ?? 0;
    path += `C${round(from.x + third)} ${round(from.y + fromSlope * third)} ${round(to.x - third)} ${round(to.y - toSlope * third)} ${round(to.x)} ${round(to.y)}`;
  }
  return path;
}

/** The runs of consecutive values, with their indexes, that a gap of `null`s splits a series into. */
export function runs(
  values: readonly (number | null)[],
): readonly (readonly { readonly index: number; readonly value: number }[])[] {
  const found: { index: number; value: number }[][] = [];
  let current: { index: number; value: number }[] = [];
  values.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) found.push(current);
      current = [];
    } else {
      current.push({ index, value });
    }
  });
  if (current.length > 0) found.push(current);
  return found;
}

/** Where a series' values go in a drawing: across by their index, down by their value. */
export interface SeriesPlacement {
  /** The x coordinate of the value at `index`. */
  readonly x: (index: number) => number;
  /** The y coordinate of `value`. */
  readonly y: (value: number) => number;
}

/**
 * The SVG path buttery draws a series as: smooth through each run of values without ever bending past one,
 * and open wherever a value is `null`. Use it to draw a series of your own the way the charts do.
 *
 * @example
 * <path d={seriesPath(values, { x: (index) => index * 10, y: (value) => 100 - value })} />
 */
export function seriesPath(
  values: readonly (number | null)[],
  placement: SeriesPlacement,
): string {
  return runs(values)
    .map((run) =>
      smoothPath(
        run.map(({ index, value }) => ({
          x: placement.x(index),
          y: placement.y(value),
        })),
      ),
    )
    .join("");
}
