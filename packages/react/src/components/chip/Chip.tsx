import { cx } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `Chip`. */
export type ChipProps = ComponentPropsWithRef<"button">;

/**
 * A small reset action that sits next to a control, such as Reset beside a slider's label: 20px tall with a
 * 24px hit area. Mark it `aria-disabled` while there's nothing to reset: it looks disabled and ignores
 * presses, and keeps keyboard focus after the reset it just did.
 *
 * @example
 * <Chip aria-disabled={rotation === 0} onClick={() => setRotation(0)}>Reset</Chip>
 */
export function Chip({
  className,
  type,
  onClick,
  children,
  ...rest
}: ChipProps): ReactElement {
  const unavailable =
    rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
  return (
    <button
      {...rest}
      type={type ?? "button"}
      onClick={(event) => {
        if (unavailable) event.preventDefault();
        else onClick?.(event);
      }}
      className={cx("bt-chip bt-press bt-focus", className)}
      data-bt="Chip"
      data-bt-control=""
    >
      <span className="bt-truncate" data-bt-part="label" data-bt-truncate="">
        {children}
      </span>
      <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
    </button>
  );
}
