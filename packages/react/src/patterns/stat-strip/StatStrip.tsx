import {
  AnimationTrackingContext,
  cx,
  easingCurves,
  timing,
  trackAnimation,
  useMotionPreference,
} from "@buttery/core";
import { animate } from "motion";
import { VisuallyHidden } from "radix-ui";
import { createContext, use, useEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** The strip a stat sits in: how many columns share its row. */
const StripContext = createContext<2 | 4 | null>(null);

/** Props for `StatStrip`. */
export interface StatStripProps extends ComponentPropsWithRef<"div"> {
  /** How many stats share the row: `2` or `4` (the default). Four fall into two rows of two below 640px of page. */
  readonly columns?: 2 | 4 | undefined;
}

/**
 * A row of headline numbers in equal columns, each `Stat` behind a 1px hairline: `display` numbers in two
 * columns, `heading-1` in four, so a long number still fits its column. Four columns fall into two rows of
 * two when the strip is under 640px wide, wherever it sits. The numbers count up once as the row comes into
 * view.
 *
 * @example
 * <StatStrip>
 *   <Stat value={1200000} suffix="+" label="cards exported" />
 *   <Stat value={48} label="countries" />
 * </StatStrip>
 */
export function StatStrip({
  columns = 4,
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
    >
      <div role="list" data-bt-part="list">
        <StripContext value={columns}>{children}</StripContext>
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
  const columns = use(StripContext);
  const counter = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);
  const decimals = decimalsOf(value);
  const final = writeStat(value, { prefix, suffix, decimals, format });

  useEffect(() => {
    const node = counter.current;
    if (!node || reduced || counted.current) return undefined;
    const writing: StatWriting = { prefix, suffix, decimals, format };
    node.textContent = writeStat(0, writing);
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
            node.textContent = writeStat(amount, writing);
          },
        });
        void controls.finished.then(() => {
          node.textContent = final;
          release?.();
        });
        stop = () => {
          controls.complete();
          release?.();
        };
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop?.();
      node.textContent = final;
    };
  }, [value, prefix, suffix, decimals, format, reduced, tracked, final]);

  return (
    <div
      {...rest}
      role={columns === null ? undefined : "listitem"}
      className={cx("bt-stat", className)}
      data-bt="Stat"
    >
      <span
        className="bt-text"
        data-role={columns === 4 ? "heading-1" : "display"}
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
      <span className="bt-text" data-role="body" data-bt-part="label">
        {label}
      </span>
    </div>
  );
}
