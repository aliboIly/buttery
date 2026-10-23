import { Morph, cx, useControllableState } from "@butteryui/core";
import { RadioGroup as RadixRadioGroup } from "radix-ui";
import { useId } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** One option in a `RadioCardGroup`. */
export interface RadioCardOption<Value extends string = string> {
  /** What choosing it sets. */
  readonly value: Value;
  /** Its name beside the radio, in `label`. */
  readonly label: string;
  /** A line under it saying what it means, which describes its radio. */
  readonly description?: ReactNode;
  /** Shows it but stops it being chosen. Defaults to `false`. */
  readonly disabled?: boolean | undefined;
  /** A field of its own that opens under it while it's chosen, such as a `Select`. */
  readonly detail?: ReactNode;
}

/** Props for `RadioCardGroup`. */
export interface RadioCardGroupProps<
  Value extends string = string,
> extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "dir"
> {
  /** Names the group for screen readers, such as "Renewal screening". */
  readonly label: string;
  /** The options, in order. */
  readonly options: readonly RadioCardOption<Value>[];
  /** The option chosen. Pair with `onValueChange` to control it. */
  readonly value?: Value | undefined;
  /** The option chosen first when uncontrolled. Defaults to the first that isn't disabled. */
  readonly defaultValue?: Value | undefined;
  /** Called with an option's value when it's chosen. */
  readonly onValueChange?: ((value: Value) => void) | undefined;
}

/**
 * A choice of one among a few options, each an 18px radio beside its name in `label`, a line about it in
 * `body-sm` and `text-secondary` under the name, 12 between options. A chosen option's `detail` opens
 * under its line through `Morph` (`spring.snappy` open, `dur-fast` closed), lined up with the name. Arrow
 * keys move between the options and choose as they go, as a radio group does.
 *
 * @example
 * <RadioCardGroup
 *   label="Renewal screening"
 *   options={[
 *     { value: "all", label: "Screen every renewal" },
 *     { value: "some", label: "Screen the first renewals only", detail: <Select … /> },
 *   ]}
 *   value={screening}
 *   onValueChange={setScreening}
 * />
 */
export function RadioCardGroup<Value extends string = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  ...rest
}: RadioCardGroupProps<Value>): ReactElement {
  const id = useId();
  const [chosen, choose] = useControllableState<Value | undefined>({
    value,
    defaultValue:
      defaultValue ?? options.find((option) => option.disabled !== true)?.value,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  return (
    <RadixRadioGroup.Root
      aria-label={label}
      {...rest}
      value={chosen ?? ""}
      onValueChange={(next) => {
        const option = options.find((candidate) => candidate.value === next);
        if (option) choose(option.value);
      }}
      className={cx("bt-radio-card-group", className)}
      data-bt="RadioCardGroup"
    >
      {options.map((option, index) => {
        const itemId = `${id}-${String(index)}`;
        const descriptionId = `${itemId}-description`;
        const isChosen = option.value === chosen;
        return (
          <div
            key={option.value}
            data-bt-part="option"
            data-chosen={isChosen ? "" : undefined}
          >
            <div data-bt-part="radio-card-group-row">
              <RadixRadioGroup.Item
                id={itemId}
                value={option.value}
                disabled={option.disabled}
                aria-describedby={
                  option.description === undefined ? undefined : descriptionId
                }
                className="bt-focus"
                data-bt-part="radio"
              >
                <RadixRadioGroup.Indicator data-bt-part="radio-card-group-dot" />
                <span
                  data-bt-part="radio-card-group-hit"
                  data-bt-hit=""
                  aria-hidden="true"
                />
              </RadixRadioGroup.Item>
              <label
                htmlFor={itemId}
                className="bt-text"
                data-role="label"
                data-bt-part="radio-card-group-label"
              >
                {option.label}
              </label>
            </div>
            {option.description === undefined ? null : (
              <p
                id={descriptionId}
                className="bt-text"
                data-role="body-sm"
                data-bt-part="radio-card-group-description"
              >
                {option.description}
              </p>
            )}
            {option.detail === undefined ? null : (
              <Morph
                disclosure
                contentKey={isChosen ? "open" : "closed"}
                data-bt-part="detail-frame"
              >
                {isChosen ? (
                  <div data-bt-part="radio-card-group-detail">
                    {option.detail}
                  </div>
                ) : null}
              </Morph>
            )}
          </div>
        );
      })}
    </RadixRadioGroup.Root>
  );
}
