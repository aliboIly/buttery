import type { ComponentPropsWithRef, CSSProperties, ReactElement } from "react";
import { spaceStep, spaceVar } from "../../tokens/space.ts";
import type { SpaceValue } from "../../tokens/space.ts";
import type { CssVariables } from "../../theme/create-theme.ts";
import { cx } from "../../utils/cx.ts";

/** Props for `Divider`. */
export interface DividerProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** `"horizontal"` (the default) runs across a column; `"vertical"` separates items in a row. */
  readonly orientation?: "horizontal" | "vertical" | undefined;
  /**
   * Length of a vertical divider on the spacing scale, such as `6` for the 24px separator in a header.
   * Without it the divider spans the row's full height.
   */
  readonly length?: SpaceValue | undefined;
  /**
   * Hide the divider from screen readers when it's purely visual. Defaults to `false`, which announces it
   * as a separator.
   */
  readonly decorative?: boolean | undefined;
}

/**
 * A 1px line in the border color between groups of content.
 *
 * @example
 * <Inline gap={3}>
 *   <Text variant="label">Spring launch</Text>
 *   <Divider orientation="vertical" length={6} decorative />
 *   <Text variant="control">Saved</Text>
 * </Inline>
 */
export function Divider({
  orientation = "horizontal",
  length,
  decorative = false,
  className,
  style,
  ...rest
}: DividerProps): ReactElement {
  const merged: CSSProperties & CssVariables =
    length === undefined
      ? { ...style }
      : {
          ...style,
          "--bt-divider-length": `var(${spaceVar(spaceStep(length))})`,
        };
  return (
    <div
      {...(decorative
        ? { role: "none" }
        : { role: "separator", "aria-orientation": orientation })}
      {...rest}
      className={cx("bt-divider", className)}
      style={merged}
      data-bt="Divider"
      data-orientation={orientation}
      data-length={length === undefined ? undefined : ""}
    />
  );
}
