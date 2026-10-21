import { Slot } from "../../utils/slot.tsx";
import type { ComponentPropsWithRef, CSSProperties, ReactElement } from "react";
import type { CssVariables } from "../../theme/create-theme.ts";
import { cx } from "../../utils/cx.ts";
import type { FlowAlign } from "../flow.ts";
import { spacingAttributes } from "../spacing.ts";
import type { SpacingProps } from "../spacing.ts";

/** Column counts `Grid` accepts. */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Columns that change with the space the grid has: `base` below 640px of its container, `md` from 640 and
 * `lg` from 1024 (the page's breakpoints). A size left out keeps the one below it.
 */
export interface ResponsiveGridColumns {
  /** Columns below 640px. Defaults to `1`. */
  readonly base?: GridColumns | undefined;
  /** Columns from 640px. */
  readonly md?: GridColumns | undefined;
  /** Columns from 1024px. */
  readonly lg?: GridColumns | undefined;
}

/** Props for `Grid`. */
export interface GridProps extends ComponentPropsWithRef<"div">, SpacingProps {
  /**
   * Number of equal columns, or columns that change with the container's width, such as
   * `{ base: 1, md: 3 }`. Defaults to `1`.
   */
  readonly columns?: GridColumns | ResponsiveGridColumns | undefined;
  /** Vertical alignment of items within their row. Defaults to `"stretch"`. */
  readonly align?: FlowAlign | undefined;
  /** Render the single child element instead of a `div`, with Grid's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Equal columns with a gap from the spacing scale. Every column can shrink to zero, so one long item never
 * widens its column. Give `columns` an object to change them with the space: `{ base: 1, md: 3 }` stacks
 * on a phone and makes three columns from 640px of the nearest size container (a `Page`, a panel).
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
  const Root = asChild ? Slot : "div";
  const steps: ResponsiveGridColumns =
    typeof columns === "number" ? { base: columns } : columns;
  const base = steps.base ?? 1;
  const md = steps.md ?? base;
  const lg = steps.lg ?? md;
  const merged: CSSProperties & CssVariables = {
    ...style,
    "--bt-grid-columns-base": String(base),
    "--bt-grid-columns-md": String(md),
    "--bt-grid-columns-lg": String(lg),
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
