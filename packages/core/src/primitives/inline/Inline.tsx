import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import type { FlowAlign, FlowJustify } from "../flow.ts";
import { spacingAttributes } from "../spacing.ts";
import type { SpacingProps } from "../spacing.ts";

export interface InlineProps
  extends ComponentPropsWithRef<"div">, SpacingProps {
  /** Cross-axis (vertical) alignment. Defaults to `"center"`. */
  readonly align?: FlowAlign | undefined;
  /** Main-axis (horizontal) distribution. Defaults to `"start"`; ignored when `uniform`. */
  readonly justify?: FlowJustify | undefined;
  /** Give every child the same width, such as a dialog's back and forward buttons. Defaults to `false`. */
  readonly uniform?: boolean | undefined;
  /**
   * Let children wrap onto more lines. Defaults to `false`. Toolbars, header bars and nav bars never wrap:
   * use `OverflowCluster` for those.
   */
  readonly wrap?: boolean | undefined;
  /** Render the single child element instead of a `div`, with Inline's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Lays children out in a row with a gap from the spacing scale, vertically centered by default.
 *
 * @example
 * <Inline gap={1.5}>
 *   <Icon icon={Copy} />
 *   <Text variant="button">Copy</Text>
 * </Inline>
 */
export function Inline({
  gap,
  pad,
  padX,
  padY,
  align,
  justify,
  uniform = false,
  wrap = false,
  asChild = false,
  ...rest
}: InlineProps): ReactElement {
  const Root = asChild ? Slot.Root : "div";
  return (
    <Root
      {...rest}
      data-bt="Inline"
      data-align={align}
      data-justify={justify}
      data-uniform={uniform ? "" : undefined}
      data-wrap={wrap ? "" : undefined}
      {...spacingAttributes({ gap, pad, padX, padY })}
    />
  );
}
