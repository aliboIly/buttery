import { cx } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `Chip`. */
export type ChipProps = ComponentPropsWithRef<"button">;

/**
 * A small reset action that sits next to a control, such as Reset beside a slider's label: 20px tall with a
 * 24px hit area. Disable it while there's nothing to reset.
 *
 * @example
 * <Chip disabled={rotation === 0} onClick={() => setRotation(0)}>Reset</Chip>
 */
export function Chip({
  className,
  type,
  children,
  ...rest
}: ChipProps): ReactElement {
  return (
    <button
      {...rest}
      type={type ?? "button"}
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
