import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { spacingAttributes } from "../spacing.ts";
import type { SpacingProps } from "../spacing.ts";

export interface CenterProps
  extends ComponentPropsWithRef<"div">, Omit<SpacingProps, "gap"> {
  /** Render the single child element instead of a `div`, with Center's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Centers its content on both axes and fills the space it's given, such as an empty state in a stage.
 *
 * @example
 * <Center pad={8}>
 *   <Text variant="title">Your canvas is empty</Text>
 * </Center>
 */
export function Center({
  pad,
  padX,
  padY,
  asChild = false,
  ...rest
}: CenterProps): ReactElement {
  const Root = asChild ? Slot.Root : "div";
  return (
    <Root
      {...rest}
      data-bt="Center"
      {...spacingAttributes({ pad, padX, padY })}
    />
  );
}
