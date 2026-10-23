import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement } from "react";
import type { BadgeVariant, StatusTone } from "../status-badge/StatusBadge.tsx";

/** Props for `TagChip`. */
export interface TagChipProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** What the tag says, such as "Free trial". */
  readonly children: string;
  /** The tag's color: `"neutral"` (the default), `"info"`, `"success"`, `"warning"` or `"danger"`. */
  readonly tone?: StatusTone | undefined;
  /**
   * `"outline"` (the default), a 1px `border` edge with only the dot in the tone's color; `"soft"`, on the tone's
   * subtle background with its words in the tone; or `"solid"`, filled with the tone's strong color.
   */
  readonly variant?: BadgeVariant | undefined;
}

/**
 * A small tag with a 6px colored dot before its words, for what something is, such as new or a free trial, on
 * a catalog card. 20px tall (18 compact), the `badge` text role: outlined in `text-secondary` by default, or
 * soft or solid in its tone. It's text, not a control: for a status use `StatusBadge`, for a filter `FilterPill`.
 *
 * @example
 * <TagChip tone="success">Free trial</TagChip>
 */
export function TagChip({
  tone = "neutral",
  variant = "outline",
  className,
  children,
  ...rest
}: TagChipProps): ReactElement {
  return (
    <span
      {...rest}
      className={cx("bt-tag-chip", className)}
      data-bt="TagChip"
      data-tone={tone}
      data-variant={variant}
    >
      <span data-bt-part="dot" aria-hidden="true" />
      <span className="bt-truncate" data-bt-truncate="" title={children}>
        {children}
      </span>
    </span>
  );
}
