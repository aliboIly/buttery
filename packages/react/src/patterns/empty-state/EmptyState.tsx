import { Icon, TextStack, cx, hasContent } from "@butteryui/core";
import type {
  IconComponentProps,
  TextStackTitleElement,
} from "@butteryui/core";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";

/** How much room an empty state takes: `"sm"` for a panel or a table, `"md"`, or `"lg"` for a whole page. */
export type EmptyStateSize = "sm" | "md" | "lg";

/** How an empty state is drawn: `"plain"`, or `"dashed"`, inside the dashed edge a drop target has. */
export type EmptyStateVariant = "plain" | "dashed";

/** Props for `EmptyState`. */
export interface EmptyStateProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** What's missing, such as "No orders yet". */
  readonly title: ReactNode;
  /** How to add it, 12px under the title, such as "Orders show up here once a customer checks out." */
  readonly description?: ReactNode;
  /** The ways to add it, 24px under the text: a primary and a secondary pill. */
  readonly actions?: ReactNode;
  /** An icon for what's missing, drawn 20px in a 48px tile 16px above the title, such as `Receipt` for orders. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** A link to read more, 16px under the text, such as `<ArrowLink href="…">How orders work</ArrowLink>`. */
  readonly docs?: ReactNode;
  /** What the title renders as. Defaults to `"h2"`. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /**
   * How much room it takes: `"sm"` for a panel or a table (a 40px tile, the line 8 under the title and the
   * actions 16 under the text), `"md"` (the default), or `"lg"` for a whole page (a 56px tile, a `title-lg`
   * heading over `body` text, and the actions 32 under it).
   */
  readonly size?: EmptyStateSize | undefined;
  /**
   * `"plain"` (the default), or `"dashed"`: inside a 2px dashed edge with 16px corners, as a drop target is
   * drawn, padded 24, 32 or 48 by its size.
   */
  readonly variant?: EmptyStateVariant | undefined;
}

/**
 * What shows where content will be: an optional icon tile, a title, a line about how to add some, an
 * optional docs link and the actions that do, centered, measured between trimmed text, at a panel's, a
 * stage's or a page's size, plain or inside a dashed edge. Put it in a `DropZone` so files dropped or pasted
 * on it land.
 *
 * @example
 * <EmptyState
 *   title="An empty gift card"
 *   description="Pick one of the shop's designs, or upload a photo of your own."
 *   actions={<><Button variant="primary">Pick a design</Button><Button variant="secondary">Upload a photo</Button></>}
 * />
 */
export function EmptyState({
  title,
  description,
  actions,
  icon,
  docs,
  titleAs = "h2",
  size = "md",
  variant = "plain",
  className,
  ...rest
}: EmptyStateProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-empty-state", className)}
      data-bt="EmptyState"
      data-size={size}
      data-variant={variant}
    >
      <div data-bt-part="content">
        {icon === undefined ? null : (
          <span data-bt-part="empty-state-icon">
            <Icon icon={icon} size="md" />
          </span>
        )}
        <TextStack
          size={size === "lg" ? "feature" : "empty"}
          align="center"
          title={title}
          body={description}
          titleAs={titleAs}
        />
        {hasContent(docs) ? <div data-bt-part="docs">{docs}</div> : null}
      </div>
      {hasContent(actions) ? <div data-bt-part="actions">{actions}</div> : null}
    </div>
  );
}
