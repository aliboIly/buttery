import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import type { FlowAlign, FlowJustify } from "../flow.ts";
import { spacingAttributes } from "../spacing.ts";
import type { SpacingProps } from "../spacing.ts";

export interface StackProps extends ComponentPropsWithRef<"div">, SpacingProps {
  /** Cross-axis (horizontal) alignment. Defaults to `"stretch"`. */
  readonly align?: FlowAlign | undefined;
  /** Main-axis (vertical) distribution. Defaults to `"start"`. */
  readonly justify?: FlowJustify | undefined;
  /** Render the single child element instead of a `div`, with Stack's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Lays children out in a column with a gap from the spacing scale. Children can shrink below their content
 * width, so long text wraps or truncates instead of pushing the column wider.
 *
 * @example
 * <Stack gap={3}>
 *   <Text variant="title">Your canvas is empty</Text>
 *   <Text variant="body-sm">Bring in a photo, or start from a blank card.</Text>
 * </Stack>
 */
export function Stack({
  gap,
  pad,
  padX,
  padY,
  align,
  justify,
  asChild = false,
  ...rest
}: StackProps): ReactElement {
  const Root = asChild ? Slot.Root : "div";
  return (
    <Root
      {...rest}
      data-bt="Stack"
      data-align={align}
      data-justify={justify}
      {...spacingAttributes({ gap, pad, padX, padY })}
    />
  );
}
