import type {
  ComponentPropsWithRef,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";
import type { CssVariables } from "../../theme/create-theme.ts";
import type { SpaceValue } from "../../tokens/space.ts";
import { cx } from "../../utils/cx.ts";
import { spacingAttributes } from "../spacing.ts";

export interface FitBoxProps extends ComponentPropsWithRef<"div"> {
  /** Width ÷ height of the content box, such as `16 / 9`. Must be a positive number. */
  readonly ratio: number;
  /** Least space between the content box and the edges, on the spacing scale. Defaults to `0`. */
  readonly inset?: SpaceValue | undefined;
  /** Props for the content box itself, such as a ref to measure it. */
  readonly contentProps?: ComponentPropsWithRef<"div"> | undefined;
  /** What to draw in the content box; it fills the box. */
  readonly children?: ReactNode;
}

/**
 * Draws its content in the largest box of the given aspect ratio that fits, centered. It never overflows
 * and needs no JavaScript to follow resizes. Its child fills the content box. FitBox fills its parent,
 * which needs a definite height: a sized grid or flex cell, or an explicit block size.
 *
 * @example
 * <FitBox ratio={4 / 3} inset={8}>
 *   <Surface level="card" />
 * </FitBox>
 */
export function FitBox({
  ratio,
  inset,
  contentProps,
  children,
  className,
  style,
  ...rest
}: FitBoxProps): ReactElement {
  if (!(Number.isFinite(ratio) && ratio > 0)) {
    throw new RangeError(
      `[buttery:FitBox] ratio must be a positive number, got ${String(ratio)}. Fix: <FitBox ratio={16 / 9}>`,
    );
  }
  const merged: CSSProperties & CssVariables = {
    ...style,
    "--bt-fitbox-ratio": String(ratio),
  };
  return (
    <div
      {...rest}
      className={cx("bt-fit-box", className)}
      style={merged}
      data-bt="FitBox"
      {...spacingAttributes({ pad: inset })}
    >
      <div {...contentProps} data-bt-part="content">
        {children}
      </div>
    </div>
  );
}
