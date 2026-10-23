import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement } from "react";
import type { BadgeVariant } from "../status-badge/StatusBadge.tsx";

/** Props for `ValueBadge`. */
export interface ValueBadgeProps extends ComponentPropsWithRef<"span"> {
  /** Values to keep room for, such as the formatted minimum and maximum, so the badge never changes width. */
  readonly reserve?: readonly string[] | undefined;
  /**
   * `"soft"` (the default) on `bg-control`, `"solid"` filled with `text-secondary` under text in the surface's
   * color, or `"outline"`, a 1px `border` edge with no fill, for a quiet row where a filled badge would be loud.
   */
  readonly variant?: BadgeVariant | undefined;
}

/**
 * A small badge that shows a formatted value and keeps room for its longest value, so it never changes
 * width as the value moves. Digits are tabular. Soft by default; solid and outline keep its size.
 *
 * @example
 * <ValueBadge reserve={["-180°", "180°"]}>{`${angle}°`}</ValueBadge>
 */
export function ValueBadge({
  reserve = [],
  variant = "soft",
  className,
  children,
  ...rest
}: ValueBadgeProps): ReactElement {
  return (
    <span
      {...rest}
      className={cx("bt-value-badge", className)}
      data-bt="ValueBadge"
      data-bt-control=""
      data-variant={variant}
    >
      <span data-bt-part="value">{children}</span>
      {reserve.map((text) => (
        <span key={text} data-bt-part="reserve" aria-hidden="true">
          {text}
        </span>
      ))}
    </span>
  );
}
