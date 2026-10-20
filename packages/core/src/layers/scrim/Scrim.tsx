import type { ComponentPropsWithRef, ReactElement } from "react";
import { cx } from "../../utils/cx.ts";

export interface ScrimProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /**
   * `"dim"` (the default) darkens the page behind a modal; `"blur"` blurs it under a light wash, for menus
   * that open over content.
   */
  readonly variant?: "dim" | "blur" | undefined;
}

/**
 * Covers the viewport behind a layer's content. Put it first inside a `Layer` so it sits under the
 * content it belongs to. It's hidden from assistive technology; give it an `onClick` to close on outside
 * clicks.
 *
 * @example
 * <Layer band="modal">
 *   <Scrim onClick={close} />
 *   <Surface level="dialog">…</Surface>
 * </Layer>
 */
export function Scrim({
  variant = "dim",
  className,
  ...rest
}: ScrimProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      {...rest}
      className={cx("bt-scrim", className)}
      data-bt="Scrim"
      data-variant={variant}
    />
  );
}
