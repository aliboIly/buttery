import { cx, hasContent } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import {
  FormFieldCaption,
  FormFieldError,
  useFormFieldIds,
} from "../../parts/form-field/FormFieldParts.tsx";

/** What a field's control needs to be labelled and described: spread it onto the control. */
export interface FieldControlProps {
  /** Ties the label to a native control through its `htmlFor`. */
  readonly id: string;
  /** Names any control, native or not, by the label. */
  readonly "aria-labelledby": string;
  /** The hint and the error, while they show. */
  readonly "aria-describedby": string | undefined;
  /** Set while there's an error. */
  readonly "aria-invalid": true | undefined;
  /** Set when the control needs an answer. */
  readonly "aria-required": true | undefined;
}

/** Props for `Field`. */
export interface FieldProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** What the control asks for, shown above it. */
  readonly label: string;
  /** A hint under the label, such as the format expected. */
  readonly hint?: ReactNode;
  /** What's wrong, shown under the control and read with it. Leave it out while nothing is. */
  readonly error?: ReactNode;
  /** Whether the control needs an answer; screen readers say so. */
  readonly required?: boolean | undefined;
  /** The control's id, when it needs a particular one. */
  readonly controlId?: string | undefined;
  /**
   * Whether a new error is read out as it appears. Defaults to `true`; turn it off when an error summary
   * that takes focus reads the errors instead.
   */
  readonly announceError?: boolean | undefined;
  /** Renders the control, given the props that label and describe it. */
  readonly children: (control: FieldControlProps) => ReactNode;
}

/**
 * A label, an optional hint and an error wired to a control you bring: a buttery control without a form
 * label of its own, such as an outline `Select` or a `SegmentedControl`, or your own. `TextField`,
 * `PasswordField` and `TextArea` already do this.
 *
 * @example
 * <Field label="Export as" hint="CSV opens in any spreadsheet app." error={formatError}>
 *   {(control) => <Select {...control} label="Export as" variant="outline" options={formats} />}
 * </Field>
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  controlId,
  announceError = true,
  className,
  children,
  ...rest
}: FieldProps): ReactElement {
  const invalid = hasContent(error);
  const ids = useFormFieldIds({
    id: controlId,
    describedBy: undefined,
    hint: hasContent(hint),
    error: invalid,
  });
  return (
    <div
      {...rest}
      className={cx("bt-field bt-form-field", className)}
      data-bt="Field"
      data-invalid={invalid ? "" : undefined}
    >
      <FormFieldCaption
        htmlFor={ids.control}
        labelId={ids.label}
        label={label}
        hint={hint}
        hintId={ids.hint}
      />
      {children({
        id: ids.control,
        "aria-labelledby": ids.label,
        "aria-describedby": ids.describedBy,
        "aria-invalid": invalid || undefined,
        "aria-required": required || undefined,
      })}
      <FormFieldError id={ids.error} name={label} announce={announceError}>
        {error}
      </FormFieldError>
    </div>
  );
}
