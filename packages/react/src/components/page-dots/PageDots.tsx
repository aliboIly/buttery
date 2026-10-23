import { cx, useLayoutAnimation } from "@butteryui/core";
import { motion } from "motion/react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `PageDots`. */
export interface PageDotsProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** How many steps there are. */
  readonly count: number;
  /** The current step, from 0. */
  readonly value: number;
  /**
   * What screen readers hear for the current step. Defaults to "Step 2 of 4".
   */
  readonly label?: ((step: number, count: number) => string) | undefined;
}

function stepOf(step: number, count: number): string {
  return `Step ${String(step + 1)} of ${String(count)}`;
}

/**
 * A row of 6px dots showing which step of a few is current: the current one is an 18px pill, and moving on
 * shrinks it as the next one grows, on `spring.snappy`. It shows progress and takes no presses; screen
 * readers hear it as one image, "Step 2 of 4".
 *
 * @example
 * <PageDots count={4} value={step} />
 */
export function PageDots({
  count,
  value,
  label = stepOf,
  className,
  ...rest
}: PageDotsProps): ReactElement {
  const layout = useLayoutAnimation("snappy");
  const current = Math.min(Math.max(value, 0), count - 1);
  return (
    <div
      {...rest}
      role="img"
      aria-label={label(current, count)}
      className={cx("bt-page-dots", className)}
      data-bt="PageDots"
    >
      {Array.from({ length: count }, (_, step) => (
        <motion.span
          key={step}
          {...layout}
          layoutDependency={current}
          data-bt-part="dot"
          data-active={step === current ? "" : undefined}
        />
      ))}
    </div>
  );
}
