import { Icon, cx } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import type { ComponentPropsWithRef, ComponentType, ReactElement } from "react";

/** A status badge's tone: what the state means, repeated in color. */
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

/** Props for `StatusBadge`. */
export interface StatusBadgeProps extends ComponentPropsWithRef<"span"> {
  /** `"neutral"` (the default), `"info"`, `"success"`, `"warning"` or `"danger"`. */
  readonly tone?: StatusTone | undefined;
  /** A 12px icon before the label, such as an arrow for a change. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
}

/**
 * A short label for a record's state, such as Paid or Overdue: 20px tall, r6, in the `badge` role on the
 * tone's subtle background. The label carries the meaning; the color only repeats it, so it reads the same
 * without color.
 *
 * @example
 * <StatusBadge tone="success">Paid</StatusBadge>
 */
export function StatusBadge({
  tone = "neutral",
  icon,
  className,
  children,
  ...rest
}: StatusBadgeProps): ReactElement {
  return (
    <span
      {...rest}
      className={cx("bt-status-badge", className)}
      data-bt="StatusBadge"
      data-tone={tone}
    >
      {icon === undefined ? null : <Icon icon={icon} />}
      <span data-bt-part="label">{children}</span>
    </span>
  );
}
