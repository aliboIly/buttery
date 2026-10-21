import { Slot, cx } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `Container`. */
export interface ContainerProps extends ComponentPropsWithRef<"div"> {
  /** Render the single child element instead of a `div`, with Container's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * The page's content column: at most `--bt-w-page` (1200px) wide and centered, with side padding of 16,
 * 24 or 32px as the page grows past 640 and 1024px. It centers with padding rather than margins, so it
 * never sets an outer margin. `Section` puts one in for you.
 *
 * @example
 * <Container>
 *   <Grid columns={12} gap={6}>…</Grid>
 * </Container>
 */
export function Container({
  asChild = false,
  className,
  ...rest
}: ContainerProps): ReactElement {
  const Root = asChild ? Slot : "div";
  return (
    <Root
      {...rest}
      className={cx("bt-container", className)}
      data-bt="Container"
    />
  );
}
