import { Icon, cx, hasContent } from "@butteryui/core";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** A callout's kind: `"info"`, `"success"`, `"warning"` or `"danger"` for an error. */
export type CalloutTone = "info" | "success" | "warning" | "danger";

/**
 * How a callout draws itself: `"soft"`, the tone's tint; `"outline"`, a 1px edge in the tone's color on the
 * surface; or `"accent"`, the tint with a bar of the tone's color along its start edge.
 */
export type CalloutVariant = "soft" | "outline" | "accent";

/** Props for `Callout`. */
export interface CalloutProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** What kind of message it is, which sets its tint and icon. Defaults to `"info"`. */
  readonly tone?: CalloutTone | undefined;
  /**
   * How it draws itself: `"soft"` (the default), the tone's tint; `"outline"`, a 1px edge in the tone's color
   * on the surface; or `"accent"`, the tint with a 4px bar of the tone's color along its start edge.
   */
  readonly variant?: CalloutVariant | undefined;
  /** A short heading for the message. */
  readonly title?: ReactNode;
  /** Something to do about it, such as a link or a small button, under the text. */
  readonly action?: ReactNode;
}

const ICONS = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
} as const;

/**
 * A tinted box for a message where it applies: something to know, a result, a warning or an error, drawn
 * soft, outlined or with an accent bar. Give an error that appears after an action `role="alert"` so it's
 * read out, and a result that appears `role="status"`; a message that's there from the start needs neither.
 *
 * @example
 * <Callout tone="danger" title="Couldn't sign in" role="alert">
 *   Check your email and password, then try again.
 * </Callout>
 */
export function Callout({
  tone = "info",
  variant = "soft",
  title,
  action,
  className,
  children,
  ...rest
}: CalloutProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-callout", className)}
      data-bt="Callout"
      data-tone={tone}
      data-variant={variant}
    >
      <Icon icon={ICONS[tone]} />
      <div data-bt-part="content">
        {hasContent(title) ? (
          <p className="bt-text" data-role="label" data-bt-part="title">
            {title}
          </p>
        ) : null}
        {hasContent(children) ? (
          <div data-bt-part="body">{children}</div>
        ) : null}
        {hasContent(action) ? <div data-bt-part="action">{action}</div> : null}
      </div>
    </div>
  );
}
