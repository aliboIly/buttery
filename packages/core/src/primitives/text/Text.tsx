import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement, Ref } from "react";
import type { DisplayRole, TextRole } from "../../tokens/type.ts";
import { cx } from "../../utils/cx.ts";
import { elementRef } from "../../utils/element-ref.ts";

/** Every role on the type scale: the app roles and the page display roles. */
export type TextVariant = TextRole | DisplayRole;

/** Color overrides for `Text`. */
export type TextTone =
  "strong" | "default" | "secondary" | "tertiary" | "disabled";

const BLOCK_VARIANTS: ReadonlySet<TextVariant> = new Set<TextVariant>([
  "title",
  "dialog-title",
  "body",
  "body-sm",
  "caption",
  "display",
  "heading-1",
  "heading-2",
  "body-lg",
]);

export interface TextProps extends Omit<ComponentPropsWithRef<"span">, "ref"> {
  readonly ref?: Ref<HTMLElement> | undefined;
  /**
   * The role on the type scale. Defaults to `"label"`. Block roles (titles, body, captions, display roles)
   * render a `p` and trim their line box to the text, so the gap above and below is the gap you set.
   * The rest render a `span`.
   */
  readonly variant?: TextVariant | undefined;
  /** Color override. Defaults to the role's own color. */
  readonly tone?: TextTone | undefined;
  /**
   * Keep to one line and end with an ellipsis. When the children are a string they also become the
   * `title`, so the full text stays available. Defaults to `false`.
   */
  readonly truncate?: boolean | undefined;
  /**
   * Tabular figures, for numbers that change. A tabular number keeps its width in a row instead of
   * shrinking under its neighbors. Defaults to `false`.
   */
  readonly tabular?: boolean | undefined;
  /** Render the single child element (such as an `h2`) instead, with Text's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Text in one of buttery's type roles: size, line height, weight, tracking and color from the tokens.
 * Body text wraps at 60 characters and display headings at 22.
 *
 * @example
 * <Text variant="title" asChild>
 *   <h2>Your canvas is empty</h2>
 * </Text>
 */
export function Text({
  ref,
  variant = "label",
  tone,
  truncate = false,
  tabular = false,
  asChild = false,
  className,
  title,
  children,
  ...rest
}: TextProps): ReactElement {
  const props = {
    ...rest,
    className: cx("bt-text", truncate && "bt-truncate", className),
    title:
      truncate && title === undefined && typeof children === "string"
        ? children
        : title,
    "data-bt": "Text",
    "data-role": variant,
    "data-tone": tone,
    "data-tabular": tabular ? "" : undefined,
    "data-bt-truncate": truncate ? "" : undefined,
    children,
  };
  if (asChild) return <Slot.Root {...props} ref={ref} />;
  if (BLOCK_VARIANTS.has(variant))
    return <p {...props} ref={elementRef<HTMLParagraphElement>(ref)} />;
  return <span {...props} ref={elementRef<HTMLSpanElement>(ref)} />;
}
