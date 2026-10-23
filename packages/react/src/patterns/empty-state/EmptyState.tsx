import { Icon, TextStack, cx, hasContent } from "@buttery/core";
import type { IconComponentProps, TextStackTitleElement } from "@buttery/core";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";

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
}

/**
 * What shows where content will be: an optional icon tile, a title, a line about how to add some, an
 * optional docs link and the actions that do, centered, measured between trimmed text. Put it in a
 * `DropZone` so files dropped or pasted on it land.
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
  className,
  ...rest
}: EmptyStateProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-empty-state", className)}
      data-bt="EmptyState"
    >
      <div data-bt-part="content">
        {icon === undefined ? null : (
          <span data-bt-part="empty-state-icon">
            <Icon icon={icon} size="md" />
          </span>
        )}
        <TextStack
          size="empty"
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
