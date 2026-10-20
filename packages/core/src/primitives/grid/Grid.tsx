import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, CSSProperties, ReactElement } from "react";
import type { CssVariables } from "../../theme/create-theme.ts";
import { cx } from "../../utils/cx.ts";
import type { FlowAlign } from "../flow.ts";
import { spacingAttributes } from "../spacing.ts";
import type { SpacingProps } from "../spacing.ts";

/** Column counts `Grid` accepts. */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Props for `Grid`. */
export interface GridProps extends ComponentPropsWithRef<"div">, SpacingProps {
  /** Number of equal columns. Defaults to `1`. */
  readonly columns?: GridColumns | undefined;
  /** Vertical alignment of items within their row. Defaults to `"stretch"`. */
  readonly align?: FlowAlign | undefined;
  /** Render the single child element instead of a `div`, with Grid's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Equal columns with a gap from the spacing scale. Every column can shrink to zero, so one long item never
 * widens its column.
 *
 * @example
 * <Grid columns={3} gap={4}>
 *   <Surface level="card" pad={4}>Draft</Surface>
 *   <Surface level="card" pad={4}>Review</Surface>
 *   <Surface level="card" pad={4}>Done</Surface>
 * </Grid>
 */
export function Grid({
  columns = 1,
  gap,
  pad,
  padX,
  padY,
  align,
  asChild = false,
  className,
  style,
  ...rest
}: GridProps): ReactElement {
  const Root = asChild ? Slot.Root : "div";
  const merged: CSSProperties & CssVariables = {
    ...style,
    "--bt-grid-columns": String(columns),
  };
  return (
    <Root
      {...rest}
      className={cx("bt-grid", className)}
      style={merged}
      data-bt="Grid"
      data-align={align}
      {...spacingAttributes({ gap, pad, padX, padY })}
    />
  );
}
