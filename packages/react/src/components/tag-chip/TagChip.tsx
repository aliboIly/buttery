import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement } from "react";
import type { StatusTone } from "../status-badge/StatusBadge.tsx";

/** Props for `TagChip`. */
export interface TagChipProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** What the tag says, such as "Free trial". */
  readonly children: string;
  /** The dot's color: `"neutral"` (the default), `"info"`, `"success"`, `"warning"` or `"danger"`. */
  readonly tone?: StatusTone | undefined;
}

/**
 * A small outlined tag with a 6px colored dot before its words, for what something is, such as new or a
 * free trial, on a catalog card. 20px tall (18 compact), the `badge` text role in `text-secondary`. It's
 * text, not a control: for a status use `StatusBadge`, for a filter `FilterPill`.
 *
 * @example
 * <TagChip tone="success">Free trial</TagChip>
 */
export function TagChip({
  tone = "neutral",
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
    >
      <span data-bt-part="dot" aria-hidden="true" />
      <span className="bt-truncate" data-bt-truncate="" title={children}>
        {children}
      </span>
    </span>
  );
}
