import { cx, hasContent } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `SettingRow`. */
export interface SettingRowProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** What the setting is, an `h3` in `title-sm`. */
  readonly title: string;
  /** Its current state under the title, such as "Screening every renewal.", in `body-sm` and `text-secondary`. */
  readonly state?: ReactNode;
  /** The row's one action at its end, such as a Manage button; primary only when it turns something on. */
  readonly action?: ReactNode;
}

/**
 * One setting in a `SettingsSection`: what it is (an `h3` in `title-sm`), its current state under it in
 * `body-sm` and `text-secondary`, and its one action at the end, centered on the text beside it. The text
 * wraps; the action keeps its size.
 *
 * @example
 * <SettingRow
 *   title="Screen subscription renewals"
 *   state="Screening every renewal."
 *   action={<Button size="sm">Manage</Button>}
 * />
 */
export function SettingRow({
  title,
  state,
  action,
  className,
  children,
  ...rest
}: SettingRowProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-setting-row", className)}
      data-bt="SettingRow"
    >
      <div data-bt-part="text">
        <h3 className="bt-text" data-role="title-sm" data-bt-part="title">
          {title}
        </h3>
        {hasContent(state) ? (
          <p className="bt-text" data-role="body-sm" data-bt-part="state">
            {state}
          </p>
        ) : null}
        {children}
      </div>
      {hasContent(action) ? <div data-bt-part="action">{action}</div> : null}
    </div>
  );
}
