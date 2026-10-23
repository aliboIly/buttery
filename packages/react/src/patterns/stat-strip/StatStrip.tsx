import {
  AnimationTrackingContext,
  cx,
  easingCurves,
  timing,
  trackAnimation,
  useMotionPreference,
} from "@butteryui/core";
import { animate } from "motion";
import { VisuallyHidden } from "radix-ui";
import { createContext, use, useEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/**
 * How a stat strip lays out its stats: `"row"`, equal columns each behind a 1px hairline; `"cards"`, equal
 * columns each on a card of its own; or `"stacked"`, one column with a hairline between stats, for a narrow
 * column.
 */
export type StatStripLayout = "row" | "cards" | "stacked";

/** A stat strip's size: `"md"`, or `"lg"` with `display` numbers and `body-lg` labels whatever the columns. */
export type StatStripSize = "md" | "lg";

/** The text roles the strip gives its stats' numbers and labels. */
interface StripRoles {
  readonly number: "heading-1" | "display";
  readonly label: "body" | "body-lg";
}

const StripContext = createContext<StripRoles | null>(null);

const LARGE: StripRoles = { number: "display", label: "body-lg" };
const HEADING: StripRoles = { number: "heading-1", label: "body" };
const DISPLAY: StripRoles = { number: "display", label: "body" };

/** Props for `StatStrip`. */
export interface StatStripProps extends ComponentPropsWithRef<"div"> {
  /** How many stats share the row: `2` or `4` (the default). Four fall into two rows of two below 640px of page. */
  readonly columns?: 2 | 4 | undefined;
  /**
   * How the stats lay out: `"row"` (the default), equal columns each behind a 1px hairline; `"cards"`, equal
   * columns 16px apart, each stat on a card of its own; or `"stacked"`, one column with a hairline between
   * stats, for a narrow column such as an aside, whatever `columns` says.
   */
  readonly layout?: StatStripLayout | undefined;
  /**
   * `"md"` (the default): `display` numbers in two columns and `heading-1` in four or stacked, with `body`
   * labels. `"lg"`: `display` numbers and `body-lg` labels in every layout.
   */
  readonly size?: StatStripSize | undefined;
}

function rolesOf(
  columns: 2 | 4,
  layout: StatStripLayout,
  size: StatStripSize,
): StripRoles {
  if (size === "lg") return LARGE;
  return layout === "stacked" || columns === 4 ? HEADING : DISPLAY;
}

/**
 * Headline numbers in equal columns, each `Stat` behind a 1px hairline (or on a card of its own, or stacked in
 * one column): `display` numbers in two columns, `heading-1` in four, so a long number still fits its column,
 * and `display` throughout at `size="lg"`. Four columns fall into two rows of two when the strip is under
 * 640px wide, wherever it sits. The numbers count up once as the row comes into view.
 *
 * @example
 * <StatStrip>
 *   <Stat value={1200000} suffix="+" label="decks presented" />
 *   <Stat value={48} label="countries" />
 * </StatStrip>
 */
export function StatStrip({
  columns = 4,
  layout = "row",
  size = "md",
  className,
  children,
  ...rest
}: StatStripProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-stat-strip", className)}
      data-bt="StatStrip"
      data-columns={columns}
      data-layout={layout}
      data-size={size}
    >
      <div role="list" data-bt-part="list">
        <StripContext value={rolesOf(columns, layout, size)}>
          {children}
        </StripContext>
      </div>
    </div>
  );
}

/** Props for `Stat`. */
export interface StatProps extends ComponentPropsWithRef<"div"> {
  /** The number it shows. */
  readonly value: number;
  /** What the number counts, under it. */
  readonly label: string;
  /** Written before the number, such as a currency sign. */
  readonly prefix?: string | undefined;
  /** Written after the number, such as `"%"` or `"+"`. */
  readonly suffix?: string | undefined;
  /** Writes a number, including the ones it passes while counting. Defaults to the locale's grouping, rounded to the value's decimals. */
  readonly format?: ((value: number) => string) | undefined;
}

function decimalsOf(value: number): number {
  const [, fraction = ""] = String(value).split(".");
  return fraction.length;
}

/** How a stat writes a number: its prefix, the number, its suffix. */
interface StatWriting {
  readonly prefix: string;
  readonly suffix: string;
  readonly decimals: number;
  readonly format: ((value: number) => string) | undefined;
}

function writeStat(amount: number, writing: StatWriting): string {
  const number = writing.format
    ? writing.format(amount)
    : amount.toLocaleString(undefined, {
        minimumFractionDigits: writing.decimals,
        maximumFractionDigits: writing.decimals,
      });
  return `${writing.prefix}${number}${writing.suffix}`;
}

/**
 * One headline number and what it counts, for a `StatStrip`. As it comes into view it counts up from 0 over
 * 800ms on the enter curve, once, in tabular figures with room kept for the final number, so nothing
 * moves. Screen readers get the final number from the start; with reduced motion it shows at once.
 */
export function Stat({
  value,
  label,
  prefix = "",
  suffix = "",
  format,
  className,
  ...rest
}: StatProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracked = use(AnimationTrackingContext);
  const roles = use(StripContext);
  const counter = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);
  const decimals = decimalsOf(value);
  const final = writeStat(value, { prefix, suffix, decimals, format });

  useEffect(() => {
    const node = counter.current;
    if (!node) return undefined;
    if (reduced || counted.current) {
      node.textContent = final;
      return undefined;
    }
    const writing: StatWriting = { prefix, suffix, decimals, format };
    node.textContent = writeStat(0, writing);
    let live = true;
    let stop: (() => void) | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        counted.current = true;
        const release = tracked ? trackAnimation() : undefined;
        const controls = animate(0, value, {
          duration: timing["count-up"] / 1000,
          ease: [...easingCurves.out],
          onUpdate: (amount) => {
            if (live) node.textContent = writeStat(amount, writing);
          },
        });
        void controls.finished.then(() => {
          if (live) node.textContent = final;
          release?.();
        });
        stop = () => {
          controls.stop();
          release?.();
        };
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => {
      live = false;
      observer.disconnect();
      stop?.();
    };
  }, [value, prefix, suffix, decimals, format, reduced, tracked, final]);

  return (
    <div
      {...rest}
      role={roles === null ? undefined : "listitem"}
      className={cx("bt-stat", className)}
      data-bt="Stat"
    >
      <span
        className="bt-text"
        data-role={roles?.number ?? "display"}
        data-bt-part="number"
      >
        <span data-bt-part="room" aria-hidden="true">
          {final}
        </span>
        <span ref={counter} data-bt-part="count" aria-hidden="true">
          {final}
        </span>
        <VisuallyHidden.Root>{final}</VisuallyHidden.Root>
      </span>
      <span
        className="bt-text"
        data-role={roles?.label ?? "body"}
        data-bt-part="label"
      >
        {label}
      </span>
    </div>
  );
}
