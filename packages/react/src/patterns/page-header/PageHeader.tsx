import { OverflowCluster, cx, hasContent, useShortcut } from "@buttery/core";
import type { IconComponentProps, Shortcut } from "@buttery/core";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import type { ButtonVariant } from "../../components/button/Button.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { InfoButton } from "../../components/info-button/InfoButton.tsx";

/** Props for `PageHeader`. */
export interface PageHeaderProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** The page's title, its `h1`. Long titles truncate once the actions have folded away. */
  readonly title: string;
  /** The trail of pages above this one, a `Breadcrumbs`, over the title. Only a nested page has one. */
  readonly breadcrumbs?: ReactNode;
  /** A `ScopeBadge` after the title, saying what the page's settings apply to. */
  readonly badge?: ReactNode;
  /** One line under the title's row saying what the page is for, in `body` and `text-secondary`. */
  readonly description?: ReactNode;
  /** A figure after the title, such as a count or a balance, in the title's size at regular weight. */
  readonly value?: ReactNode;
  /** What the value means, behind an `InfoButton` after it: a tooltip on hover and focus, a popover on a press or a tap. */
  readonly valueInfo?: string | undefined;
  /** The page's actions at the end of the row: `PageHeader.Action`s, which fold into "…" when they don't fit. */
  readonly actions?: ReactNode;
  /** Names the button that lists the actions that don't fit. Defaults to `"More page actions"`. */
  readonly moreLabel?: string | undefined;
  /** Rows under the header, 16px apart, such as `Tabs` or `QuickActions`. */
  readonly children?: ReactNode;
}

function PageHeaderRoot({
  title,
  breadcrumbs,
  badge,
  description,
  value,
  valueInfo,
  actions,
  moreLabel = "More page actions",
  className,
  children,
  ...rest
}: PageHeaderProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-page-header", className)}
      data-bt="PageHeader"
      data-bt-region=""
    >
      <div data-bt-part="page-header-head">
        {hasContent(breadcrumbs) ? breadcrumbs : null}
        <div data-bt-part="page-header-bar">
          <div data-bt-part="page-header-heading">
            <h1
              className="bt-text bt-truncate"
              data-role="title-lg"
              data-bt-truncate=""
              title={title}
              data-bt-part="page-header-title"
            >
              {title}
            </h1>
            {hasContent(value) ? (
              <span
                className="bt-text"
                data-role="title-lg"
                data-bt-part="page-header-value"
              >
                {value}
              </span>
            ) : null}
            {valueInfo === undefined ? null : <InfoButton info={valueInfo} />}
            {hasContent(badge) ? badge : null}
          </div>
          {hasContent(actions) ? (
            <OverflowCluster
              gap={2}
              justify="end"
              moreLabel={moreLabel}
              data-bt-part="actions"
            >
              {actions}
            </OverflowCluster>
          ) : null}
        </div>
        {hasContent(description) ? (
          <p
            className="bt-text"
            data-role="body"
            data-bt-part="page-header-description"
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Props for `PageHeader.Action`. */
export interface PageHeaderActionProps {
  /** What it does, such as "Export". The row shows it as text unless `iconOnly`; the menu always does. */
  readonly label: string;
  /** Runs the action, from the row or from the "…" menu. */
  readonly onSelect: () => void;
  /** An icon for it: before the label, alone with `iconOnly`, and in the menu. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Shows only the icon, with the label as its tooltip and name. Needs `icon`. */
  readonly iconOnly?: boolean | undefined;
  /** `"secondary"` (the default) or `"primary"` for the page's one main action. */
  readonly variant?:
    Extract<ButtonVariant, "primary" | "secondary"> | undefined;
  /** A shortcut for it, written as `useShortcut` takes it, such as `"n"`: shown after the label (and in the "…" menu) and bound while the action can run. */
  readonly shortcut?: Shortcut | undefined;
  /** Keeps it from being chosen; its button stays focusable (`aria-disabled`). */
  readonly disabled?: boolean | undefined;
  /** Higher stays in the row longer. Defaults to 0; give the primary action the highest. */
  readonly priority?: number | undefined;
}

/** One page action: a button (or icon button) at the end of the header, and an item in the "…" menu once it doesn't fit. */
export function PageHeaderAction({
  label,
  onSelect,
  icon,
  iconOnly = false,
  variant = "secondary",
  shortcut,
  disabled = false,
  priority = 0,
}: PageHeaderActionProps): ReactElement {
  useShortcut(shortcut, onSelect, { enabled: !disabled });
  return (
    <OverflowCluster.Item
      priority={priority}
      menuItem={{ label, icon, onSelect, disabled, shortcut }}
    >
      {iconOnly && icon ? (
        <IconButton
          icon={icon}
          label={label}
          aria-disabled={disabled || undefined}
          onClick={onSelect}
        />
      ) : (
        <Button
          variant={variant}
          iconStart={icon}
          shortcut={shortcut}
          aria-disabled={disabled || undefined}
          onClick={onSelect}
        >
          {label}
        </Button>
      )}
    </OverflowCluster.Item>
  );
}

/** `PageHeader` with its `Action` part. */
export interface PageHeaderComponent {
  (props: PageHeaderProps): ReactElement;
  /** One page action. */
  readonly Action: typeof PageHeaderAction;
}

/**
 * An app page's header: its title (`h1`, `title-lg`), an optional value after it in the same size at
 * regular weight with an info button that explains it, and the page's actions at the end, 8px apart, which
 * fold into "…" before the title truncates. The primary action can show its shortcut. Rows under it, such
 * as `Tabs` or `QuickActions`, sit 16px apart.
 *
 * @example
 * <PageHeader
 *   title="Orders"
 *   value="1,284"
 *   valueInfo="Orders placed in the last 30 days."
 *   actions={
 *     <>
 *       <PageHeader.Action icon={Download} label="Export" onSelect={exportOrders} />
 *       <PageHeader.Action variant="primary" icon={Plus} label="New order" shortcut="n" priority={1} onSelect={newOrder} />
 *     </>
 *   }
 * />
 */
export const PageHeader: PageHeaderComponent = Object.assign(PageHeaderRoot, {
  Action: PageHeaderAction,
});
