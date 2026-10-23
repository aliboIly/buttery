import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `ValueBadge`. */
export interface ValueBadgeProps extends ComponentPropsWithRef<"span"> {
  /** Values to keep room for, such as the formatted minimum and maximum, so the badge never changes width. */
  readonly reserve?: readonly string[] | undefined;
}

/**
 * A small badge that shows a formatted value and keeps room for its longest value, so it never changes
 * width as the value moves. Digits are tabular.
 *
 * @example
 * <ValueBadge reserve={["-180°", "180°"]}>{`${angle}°`}</ValueBadge>
 */
export function ValueBadge({
  reserve = [],
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
