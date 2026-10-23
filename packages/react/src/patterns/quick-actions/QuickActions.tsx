import { OverflowCluster, cx } from "@butteryui/core";
import type { IconComponentProps } from "@butteryui/core";
import type { ComponentPropsWithRef, ComponentType, ReactElement } from "react";
import { Button } from "../../components/button/Button.tsx";

/** Props for `QuickActions`. */
export interface QuickActionsProps extends Omit<
  ComponentPropsWithRef<"div">,
  "aria-label"
> {
  /** Names the group for screen readers. Defaults to `"Quick actions"`. */
  readonly label?: string | undefined;
  /** Names the button that lists the actions that don't fit. Defaults to `"More quick actions"`. */
  readonly moreLabel?: string | undefined;
}

function QuickActionsRoot({
  label = "Quick actions",
  moreLabel = "More quick actions",
  className,
  children,
  ...rest
}: QuickActionsProps): ReactElement {
  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      className={cx("bt-quick-actions", className)}
      data-bt="QuickActions"
    >
      <OverflowCluster gap={2} size="sm" moreLabel={moreLabel}>
        {children}
      </OverflowCluster>
    </div>
  );
}

/** Props for `QuickActions.Action`. */
export interface QuickActionProps {
  /** What it does, such as "New order". The row and the menu both show it. */
  readonly label: string;
  /** Runs the action, from the row or from the "…" menu. */
  readonly onSelect: () => void;
  /** An icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Keeps it from being chosen; its button stays focusable (`aria-disabled`). */
  readonly disabled?: boolean | undefined;
  /** Higher stays in the row longer. Defaults to 0. */
  readonly priority?: number | undefined;
}

/** One quick action: a small soft button in the row, and an item in the "…" menu once it doesn't fit. */
export function QuickAction({
  label,
  onSelect,
  icon,
  disabled = false,
  priority = 0,
}: QuickActionProps): ReactElement {
  return (
    <OverflowCluster.Item
      priority={priority}
      menuItem={{ label, icon, onSelect, disabled }}
    >
      <Button
        variant="soft"
        size="sm"
        iconStart={icon}
        aria-disabled={disabled || undefined}
        onClick={onSelect}
      >
        {label}
      </Button>
    </OverflowCluster.Item>
  );
}

/** `QuickActions` with its `Action` part. */
export interface QuickActionsComponent {
  (props: QuickActionsProps): ReactElement;
  /** One quick action. */
  readonly Action: typeof QuickAction;
}

/**
 * A row of small soft buttons for the things people do most on a page, 8px apart, under its header. Those
 * that don't fit fold into a "…" menu, lowest priority first, and come back as the row grows.
 *
 * @example
 * <QuickActions>
 *   <QuickActions.Action icon={Plus} label="New order" onSelect={newOrder} />
 *   <QuickActions.Action icon={Download} label="Export" onSelect={exportOrders} />
 * </QuickActions>
 */
export const QuickActions: QuickActionsComponent = Object.assign(
  QuickActionsRoot,
  { Action: QuickAction },
);
