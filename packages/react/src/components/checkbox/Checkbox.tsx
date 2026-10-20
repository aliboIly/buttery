import { Icon, cx, hasContent, useControllableState } from "@buttery/core";
import { Check, Minus } from "lucide-react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import {
  FormFieldError,
  useFormFieldIds,
} from "../../parts/form-field/FormFieldParts.tsx";

/** Whether a checkbox is ticked: `true`, `false`, or `"indeterminate"` when only some of what it covers is. */
export type CheckboxState = boolean | "indeterminate";

/** Props for `Checkbox`. `ref` and other button props go to the box; `className` and `style` to the field. */
export interface CheckboxProps extends Omit<
  ComponentPropsWithRef<"button">,
  "value" | "defaultValue" | "defaultChecked" | "onChange" | "children" | "type"
> {
  /** What ticking it means, beside the box. Pressing it ticks the box too. */
  readonly label: ReactNode;
  /** A hint under the label. */
  readonly hint?: ReactNode;
  /** What's wrong, under the label and read with it, such as a box that has to be ticked. */
  readonly error?: ReactNode;
  /** Whether it's ticked. Pair with `onCheckedChange` to control it. */
  readonly checked?: CheckboxState | undefined;
  /** Whether it starts ticked when uncontrolled. Defaults to `false`. */
  readonly defaultChecked?: CheckboxState | undefined;
  /** Called when it's ticked or unticked. */
  readonly onCheckedChange?: ((checked: CheckboxState) => void) | undefined;
  /** What it submits in a form while ticked. Defaults to `"on"`. */
  readonly value?: string | undefined;
  /**
   * Whether a new error is read out as it appears. Defaults to `true`; turn it off when an error summary
   * that takes focus reads the errors instead.
   */
  readonly announceError?: boolean | undefined;
}

/**
 * A box to tick for one yes-or-no choice, with its label beside it: remember me, agree to the terms, show
 * the grid. Space ticks it from the keyboard; the label takes presses too.
 *
 * @example
 * <Checkbox label="Keep me signed in" checked={remember} onCheckedChange={(next) => setRemember(next === true)} />
 */
export function Checkbox({
  label,
  hint,
  error,
  checked,
  defaultChecked,
  onCheckedChange,
  announceError = true,
  id,
  className,
  style,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: CheckboxProps): ReactElement {
  const [state, setState] = useControllableState<CheckboxState>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });
  const invalid = hasContent(error);
  const ids = useFormFieldIds({
    id,
    describedBy,
    hint: hasContent(hint),
    error: invalid,
  });
  return (
    <div
      className={cx("bt-checkbox bt-form-field", className)}
      style={style}
      data-bt="Checkbox"
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <div data-bt-part="row">
        <RadixCheckbox.Root
          {...rest}
          id={ids.control}
          checked={state}
          onCheckedChange={setState}
          disabled={disabled}
          aria-describedby={ids.describedBy}
          aria-invalid={invalid || undefined}
          className="bt-focus"
          data-bt-part="check"
        >
          <RadixCheckbox.Indicator data-bt-part="mark">
            <Icon icon={state === "indeterminate" ? Minus : Check} />
          </RadixCheckbox.Indicator>
          <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
        </RadixCheckbox.Root>
        <label
          htmlFor={ids.control}
          className="bt-text"
          data-role="label"
          data-bt-part="label"
        >
          {label}
        </label>
      </div>
      {hasContent(hint) ? (
        <p
          id={ids.hint}
          className="bt-text"
          data-role="caption"
          data-bt-part="hint"
        >
          {hint}
        </p>
      ) : null}
      <FormFieldError
        id={ids.error}
        name={typeof label === "string" ? label : undefined}
        announce={announceError}
      >
        {error}
      </FormFieldError>
    </div>
  );
}
