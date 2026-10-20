import { Slot, cx } from "@buttery/core";
import { Slot as RadixSlot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Arrow } from "../../parts/arrow/Arrow.tsx";
import type { ArrowDirection } from "../../parts/arrow/Arrow.tsx";

/** Props for `ArrowLink`. */
export interface ArrowLinkProps extends ComponentPropsWithRef<"a"> {
  /** Which way the arrow points: `"forward"` (the default) after the label, `"back"` before it. */
  readonly arrow?: ArrowDirection | undefined;
  /** Render the single child element (such as a router's link) as the link, with the arrow merged in. */
  readonly asChild?: boolean | undefined;
}

/**
 * A text link with the navigation arrow, for See all, Learn more and moving through content. Its chevron
 * grows a stem on hover or keyboard focus, and the link never changes width.
 *
 * @example
 * <ArrowLink href="/templates">See all templates</ArrowLink>
 */
export function ArrowLink({
  arrow = "forward",
  asChild = false,
  className,
  children,
  ...rest
}: ArrowLinkProps): ReactElement {
  const classes = cx("bt-arrow-link bt-focus", className);
  const back = arrow === "back" ? <Arrow direction="back" /> : null;
  const forward = arrow === "forward" ? <Arrow direction="forward" /> : null;
  if (asChild) {
    return (
      <Slot
        {...rest}
        className={classes}
        data-bt="ArrowLink"
        data-arrow={arrow}
      >
        {back}
        <RadixSlot.Slottable>{children}</RadixSlot.Slottable>
        {forward}
      </Slot>
    );
  }
  return (
    <a {...rest} className={classes} data-bt="ArrowLink" data-arrow={arrow}>
      {back}
      <span className="bt-truncate" data-bt-part="label" data-bt-truncate="">
        {children}
      </span>
      {forward}
    </a>
  );
}
