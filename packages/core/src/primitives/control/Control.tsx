import type { ComponentPropsWithRef, ReactElement } from "react";
import { cx } from "../../utils/cx.ts";
import { Slot } from "../../utils/slot.tsx";

/** A control's height, one of the height tokens: `badge` 20, `sm` 28, `control` 34, `button` 36, `cta` 48. */
export type ControlSize = "badge" | "sm" | "control" | "button" | "cta";

/** Props for `Control`. */
export interface ControlProps extends ComponentPropsWithRef<"div"> {
  /**
   * The height, from the height tokens, with inline padding to match: `"badge"` (20px), `"sm"` (28px),
   * `"control"` (34px, the default), `"button"` (36px) or `"cta"` (48px). Compact density shrinks them.
   */
  readonly size?: ControlSize | undefined;
  /** Render the single child element instead of a `div`, such as a `Pressable` button, with Control's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * The root of a fixed-height control you build yourself: a height token and inline padding by `size`,
 * content centered 6px apart on one line, and `data-bt-control`, so the layout checks hold it to the
 * height tokens. Compose it with `Pressable` for a button, `variants()` for its looks and
 * `SharedIndicator` for a selection that slides.
 *
 * @example
 * <Control size="sm" asChild>
 *   <Pressable onClick={addOne}>Add one</Pressable>
 * </Control>
 */
export function Control({
  size = "control",
  asChild = false,
  className,
  ...rest
}: ControlProps): ReactElement {
  const Root = asChild ? Slot : "div";
  return (
    <Root
      {...rest}
      className={cx("bt-control", className)}
      data-bt="Control"
      data-size={size}
      data-bt-control=""
    />
  );
}
