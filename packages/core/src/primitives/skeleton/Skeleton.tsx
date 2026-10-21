import type { ComponentPropsWithRef, ReactElement } from "react";
import { cx } from "../../utils/cx.ts";
import type { TextVariant } from "../text/Text.tsx";

/** Props for `Skeleton`. */
export interface SkeletonProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /**
   * The type role of the text it stands in for: it takes that role's line, trimmed the same way, so the
   * text that replaces it lands in its place. Leave it out for a block the CSS around it sizes.
   */
  readonly variant?: TextVariant | undefined;
  /** Placeholder text, about as long as what it stands in for, that sets its width. Without it, it fills its row. */
  readonly text?: string | undefined;
}

/**
 * A placeholder for something still loading: `bg-control` with a light sweeping across it every
 * `dur-shimmer`, hidden from screen readers. With a `variant` it's a line of that text role, as wide as its
 * `text`; without one, a block sized by the CSS around it. It holds still with reduced motion.
 *
 * @example
 * <Skeleton variant="title-lg" text="$12,480.00" />
 */
export function Skeleton({
  variant,
  text,
  className,
  ...rest
}: SkeletonProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cx(
        "bt-skeleton",
        variant !== undefined && "bt-text",
        className,
      )}
      data-bt="Skeleton"
      data-role={variant}
      data-fit={text === undefined ? undefined : ""}
    >
      {variant === undefined ? null : (text ?? "​")}
    </span>
  );
}
