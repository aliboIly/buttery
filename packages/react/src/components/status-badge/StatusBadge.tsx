import { Icon, cx } from "@butteryui/core";
import type { IconComponentProps } from "@butteryui/core";
import type { ComponentPropsWithRef, ComponentType, ReactElement } from "react";

/** A status badge's tone: what the state means, repeated in color. */
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * How a badge draws its tone: `"soft"` on the tone's subtle background, `"solid"` filled with the tone's strong
 * color under text in the surface's color, or `"outline"` with a 1px `border` edge and no fill.
 */
export type BadgeVariant = "soft" | "solid" | "outline";

/** Props for `StatusBadge`. */
export interface StatusBadgeProps extends ComponentPropsWithRef<"span"> {
  /** `"neutral"` (the default), `"info"`, `"success"`, `"warning"` or `"danger"`. */
  readonly tone?: StatusTone | undefined;
  /**
   * `"soft"` (the default) on the tone's subtle background, `"solid"` filled with the tone's strong color for a
   * state that has to stand out, or `"outline"`, a 1px edge around the tone's text, for a quieter row.
   */
  readonly variant?: BadgeVariant | undefined;
  /** A 12px icon before the label, such as an arrow for a change. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
}

/**
 * A short label for a record's state, such as Paid or Overdue: 20px tall, r6, in the `badge` role, soft on the
 * tone's subtle background, solid in its strong color or outlined. The label carries the meaning; the color
 * only repeats it, so it reads the same without color.
 *
 * @example
 * <StatusBadge tone="success">Paid</StatusBadge>
 */
export function StatusBadge({
  tone = "neutral",
  variant = "soft",
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
      data-variant={variant}
    >
      {icon === undefined ? null : <Icon icon={icon} />}
      <span
        className="bt-truncate"
        data-bt-truncate=""
        title={typeof children === "string" ? children : undefined}
        data-bt-part="label"
      >
        {children}
      </span>
    </span>
  );
}
