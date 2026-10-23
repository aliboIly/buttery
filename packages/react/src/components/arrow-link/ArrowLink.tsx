import { Icon, Slot, cx } from "@butteryui/core";
import { ExternalLink } from "lucide-react";
import { Slot as RadixSlot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Arrow } from "../../parts/arrow/Arrow.tsx";
import type { ArrowDirection } from "../../parts/arrow/Arrow.tsx";

/** Props for `ArrowLink`. */
export interface ArrowLinkProps extends ComponentPropsWithRef<"a"> {
  /**
   * Which way the arrow points: `"forward"` (the default) after the label, `"back"` before it, or
   * `"external"`, an external-link icon after the label that holds still, for a link that leaves the app.
   */
  readonly arrow?: ArrowDirection | "external" | undefined;
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
  const forward =
    arrow === "forward" ? (
      <Arrow direction="forward" />
    ) : arrow === "external" ? (
      <Icon icon={ExternalLink} data-bt-part="external" />
    ) : null;
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
      <span
        className="bt-truncate"
        data-bt-part="label"
        data-bt-truncate=""
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      {forward}
    </a>
  );
}
