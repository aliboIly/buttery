import { TextStack, cx, hasContent } from "@buttery/core";
import type { TextStackTitleElement } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `EmptyState`. */
export interface EmptyStateProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** What's missing, such as "Add a card". */
  readonly title: ReactNode;
  /** How to add it, 12px under the title, such as "Drag a picture onto the canvas, or paste it from your clipboard." */
  readonly description?: ReactNode;
  /** The ways to add it, 24px under the text: a primary and a secondary pill. */
  readonly actions?: ReactNode;
  /** What the title renders as. Defaults to `"h2"`. */
  readonly titleAs?: TextStackTitleElement | undefined;
}

/**
 * What shows where content will be: a title, a line about how to add some and the actions that do,
 * centered, measured between trimmed text. Put it in a `DropZone` so files dropped or pasted on it land.
 *
 * @example
 * <EmptyState
 *   title="An empty canvas"
 *   description="Start a fresh card, or open one from your library."
 *   actions={<><Button variant="primary">New card</Button><Button variant="secondary">Open library</Button></>}
 * />
 */
export function EmptyState({
  title,
  description,
  actions,
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
      <TextStack
        size="empty"
        align="center"
        title={title}
        body={description}
        titleAs={titleAs}
      />
      {hasContent(actions) ? <div data-bt-part="actions">{actions}</div> : null}
    </div>
  );
}
