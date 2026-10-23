import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `HoverActions`. */
export interface HoverActionsProps extends ComponentPropsWithRef<"div"> {
  /** The row's actions, such as a small `IconButton`, kept out of sight until the row is hovered or holds focus. */
  readonly actions: ReactNode;
  /** What the row shows. */
  readonly children?: ReactNode;
}

/**
 * A row whose actions stay out of sight until it's hovered or holds keyboard focus. Then its background
 * takes `bg-item-hover`, a 2px `accent` bar shows at its start and its actions fade in over `dur-fast`.
 * The actions stay in the tab order while hidden, so Tab reaches them and shows them; on a touch screen,
 * which can't hover, they always show.
 *
 * @example
 * <HoverActions
 *   actions={<IconButton icon={Settings} label="Settings for payouts" size="sm" />}
 * >
 *   <Text>Payouts</Text>
 * </HoverActions>
 */
export function HoverActions({
  actions,
  className,
  children,
  ...rest
}: HoverActionsProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-hover-actions", className)}
      data-bt="HoverActions"
    >
      <span data-bt-part="bar" aria-hidden="true" />
      <div data-bt-part="content">{children}</div>
      <div data-bt-part="actions">{actions}</div>
    </div>
  );
}
