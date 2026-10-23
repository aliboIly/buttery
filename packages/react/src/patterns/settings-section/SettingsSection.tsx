import { cx } from "@butteryui/core";
import type { MotionElementProps } from "@butteryui/core";
import { useId } from "react";
import type { ReactElement, ReactNode, SubmitEvent } from "react";
import { Button } from "../../components/button/Button.tsx";
import { LoadingPill } from "../../components/loading-pill/LoadingPill.tsx";
import { AppPage } from "../app-page/AppPage.tsx";

/** Props for `SettingsSection`. */
export interface SettingsSectionProps extends Omit<
  MotionElementProps<"section">,
  "title" | "onSubmit"
> {
  /** The section's heading, an `h2` in `title-md`, which names it. */
  readonly title: string;
  /** One line under the heading saying what the section is for. */
  readonly description?: ReactNode;
  /** The section's one action at the end of the heading's row, such as an Edit button. A form's Save and Cancel take its place. */
  readonly action?: ReactNode;
  /** Draws a hairline under the heading's row, for a section of `SettingRow`s. Defaults to `false`. */
  readonly divider?: boolean | undefined;
  /** Shows a loading pill in place of the content while the section's data loads, the rest of the page staying ready. Defaults to `false`. */
  readonly loading?: boolean | undefined;
  /** What the loading pill says. Defaults to `"Loading"`. */
  readonly loadingLabel?: string | undefined;
  /**
   * Makes the content a form, with Save (primary) and Cancel that stay disabled until `dirty`. Called on
   * Save, and on Enter in a field while there's a change.
   */
  readonly onSave?: (() => void) | undefined;
  /** Whether anything in the form has changed, which enables Save and Cancel. Defaults to `false`. */
  readonly dirty?: boolean | undefined;
  /** Called on Cancel, to put the form's values back. Without it there's no Cancel. */
  readonly onCancel?: (() => void) | undefined;
  /** Shows Save as busy while the change is saved. Defaults to `false`. */
  readonly saving?: boolean | undefined;
  /** Where Save and Cancel go: `"header"` (the default), at the end of the heading's row, or `"footer"`, under the content. Never both. */
  readonly buttons?: "header" | "footer" | undefined;
  /** Save's label. Defaults to `"Save"`. */
  readonly saveLabel?: string | undefined;
  /** Cancel's label. Defaults to `"Cancel"`. */
  readonly cancelLabel?: string | undefined;
}

/**
 * One section of a settings page, built on `AppPage.Section`: an `h2` in `title-md`, one line about it in
 * `body-sm`, its one action at the end of the heading's row, then its content 16 under it, and 32 to the
 * next section. It loads on its own (`loading` puts a loading pill in its place and marks it busy) and can
 * be a form (`onSave`): Save and Cancel sit in its header or its footer, and stay disabled until `dirty`.
 *
 * @example
 * <SettingsSection
 *   title="Pickup address"
 *   description="Where customers collect their orders."
 *   onSave={save}
 *   onCancel={reset}
 *   dirty={address !== saved}
 * >
 *   <TextField label="Address" value={address} onValueChange={setAddress} />
 * </SettingsSection>
 */
export function SettingsSection({
  title,
  description,
  action,
  divider = false,
  loading = false,
  loadingLabel = "Loading",
  onSave,
  dirty = false,
  onCancel,
  saving = false,
  buttons = "header",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  className,
  children,
  ...rest
}: SettingsSectionProps): ReactElement {
  const formId = useId();
  const form = onSave !== undefined;
  const unchanged = !dirty || undefined;
  const controls = form ? (
    <div data-bt-part="form-buttons">
      {onCancel === undefined ? null : (
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={unchanged}
          onClick={dirty ? onCancel : undefined}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        form={formId}
        variant="primary"
        size="sm"
        aria-disabled={unchanged}
        loading={saving}
      >
        {saveLabel}
      </Button>
    </div>
  ) : null;
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (dirty && !saving) onSave?.();
  };
  return (
    <AppPage.Section
      data-bt="SettingsSection"
      aria-busy={loading || undefined}
      {...rest}
      title={title}
      description={description}
      actions={
        form ? (buttons === "header" && !loading ? controls : null) : action
      }
      className={cx("bt-settings-section", className)}
      data-divider={divider ? "" : undefined}
    >
      {loading ? (
        <div data-bt-part="loading">
          <LoadingPill label={loadingLabel} announce={false} />
        </div>
      ) : form ? (
        <form id={formId} onSubmit={submit} data-bt-part="form">
          {children}
        </form>
      ) : (
        children
      )}
      {form && buttons === "footer" && !loading ? (
        <div data-bt-part="footer">{controls}</div>
      ) : null}
    </AppPage.Section>
  );
}
