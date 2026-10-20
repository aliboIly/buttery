import { Icon, cx, hasContent, useControllableState } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";
import {
  FormFieldCaption,
  FormFieldError,
  useFormFieldIds,
} from "../../parts/form-field/FormFieldParts.tsx";

/** A field's height: `"md"` (34px, for app forms) or `"lg"` (48px with 16px text, for sign-in pages). */
export type TextFieldSize = "md" | "lg";

/** Props for `TextField`. `ref`, `id` and other input props go to the input; `className` and `style` to the field. */
export interface TextFieldProps extends Omit<
  ComponentPropsWithRef<"input">,
  "size" | "value" | "defaultValue" | "children"
> {
  /** What the field asks for, shown above it. */
  readonly label: string;
  /** A hint under the label, such as the format expected. */
  readonly hint?: ReactNode;
  /** What's wrong, shown under the field and read with it. Leave it out while nothing is. */
  readonly error?: ReactNode;
  /** The text. Pair with `onValueChange` or `onChange` to control it. */
  readonly value?: string | undefined;
  /** The starting text when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with the text on every change. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** `"md"` (34px, the default) or `"lg"` (48px with 16px text, for sign-in pages). */
  readonly size?: TextFieldSize | undefined;
  /** An icon at the start of the box, such as `Mail` from lucide-react. Decorative. */
  readonly iconStart?: ComponentType<IconComponentProps> | undefined;
  /** An icon at the end of the box. Decorative. */
  readonly iconEnd?: ComponentType<IconComponentProps> | undefined;
  /**
   * Whether a new error is read out as it appears. Defaults to `true`; turn it off when an error summary
   * that takes focus reads the errors instead.
   */
  readonly announceError?: boolean | undefined;
}

/** Props for the field `TextField` and `PasswordField` both draw. */
export interface TextFieldShellProps extends TextFieldProps {
  /** The root's class and `data-bt`, so each field keeps its own name. */
  readonly root: {
    readonly className: string | undefined;
    readonly "data-bt": string;
  };
  /** Something after the input inside the box, such as a reveal button. */
  readonly end?: ReactNode;
  /** Content under the error, such as a password's requirements. */
  readonly after?: ReactNode;
  /** The id of `after`, read after the hint and the error when the input is described. */
  readonly afterId?: string | undefined;
}

/** The field behind `TextField` and `PasswordField`: label, hint, the box with its input, and the error. */
export function TextFieldShell({
  root,
  end,
  after,
  afterId,
  label,
  hint,
  error,
  value,
  defaultValue,
  onValueChange,
  onChange,
  size = "md",
  iconStart,
  iconEnd,
  announceError = true,
  id,
  className,
  style,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: TextFieldShellProps): ReactElement {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const invalid = hasContent(error);
  const ids = useFormFieldIds({
    id,
    describedBy,
    hint: hasContent(hint),
    error: invalid,
  });
  const described = [ids.describedBy, afterId]
    .filter((part) => part !== undefined)
    .join(" ");
  return (
    <div
      className={cx(root.className, "bt-form-field", className)}
      style={style}
      data-bt={root["data-bt"]}
      data-size={size}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <FormFieldCaption
        htmlFor={ids.control}
        label={label}
        hint={hint}
        hintId={ids.hint}
      />
      <div data-bt-part="box" data-bt-control="">
        {iconStart ? (
          <span data-bt-part="icon-start">
            <Icon icon={iconStart} />
          </span>
        ) : null}
        <input
          {...rest}
          id={ids.control}
          value={current}
          disabled={disabled}
          aria-describedby={described === "" ? undefined : described}
          aria-invalid={invalid || undefined}
          onChange={(event) => {
            onChange?.(event);
            setCurrent(event.target.value);
          }}
          data-bt-part="input"
        />
        {iconEnd ? (
          <span data-bt-part="icon-end">
            <Icon icon={iconEnd} />
          </span>
        ) : null}
        {end === undefined ? null : <span data-bt-part="end">{end}</span>}
      </div>
      <FormFieldError id={ids.error} announce={announceError}>
        {error}
      </FormFieldError>
      {after}
    </div>
  );
}

/**
 * A labelled box for a line of text, with a hint, an error and optional icons. The label sits above the
 * box; the hint and the error are read with the input. Pass `type`, `autoComplete` and `inputMode` as on
 * an input so browsers can fill it in.
 *
 * @example
 * <TextField label="Email" type="email" autoComplete="email" error={emailError} value={email} onValueChange={setEmail} />
 */
export function TextField(props: TextFieldProps): ReactElement {
  return (
    <TextFieldShell
      {...props}
      root={{ className: "bt-text-field", "data-bt": "TextField" }}
    />
  );
}
