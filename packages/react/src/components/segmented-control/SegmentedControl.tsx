import { SharedIndicator, cx, useControllableState } from "@buttery/core";
import { RadioGroup } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** One option of a `SegmentedControl`. */
export interface SegmentedControlOption<Value extends string> {
  /** What `value` and `onValueChange` carry. */
  readonly value: Value;
  /** What the segment says. */
  readonly label: string;
  /** Keeps the segment from being chosen. */
  readonly disabled?: boolean | undefined;
}

/** Props for `SegmentedControl`. */
export interface SegmentedControlProps<
  Value extends string = string,
> extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "dir"
> {
  /** The choices, as values that are also their labels or as `{ value, label, disabled }`. */
  readonly options: readonly (Value | SegmentedControlOption<Value>)[];
  /** The chosen value. Pair with `onValueChange` to control it. */
  readonly value?: Value | undefined;
  /** The value chosen at first when uncontrolled. Defaults to the first option. */
  readonly defaultValue?: Value | undefined;
  /** Called with the new value when the user picks another segment. */
  readonly onValueChange?: ((value: Value) => void) | undefined;
  /** What the choice is about, for screen readers, such as "Canvas fit". */
  readonly label: string;
  /** Keeps every segment from being chosen. */
  readonly disabled?: boolean | undefined;
}

function optionOf<Value extends string>(
  option: Value | SegmentedControlOption<Value>,
): SegmentedControlOption<Value> {
  return typeof option === "string" ? { value: option, label: option } : option;
}

/**
 * One choice out of a few, shown side by side in a track, with the selection sliding between them. One
 * segment is always chosen; arrow keys move the choice. Segments share one width, the widest label's.
 *
 * @example
 * <SegmentedControl label="Fill" options={["Gradient", "Solid"]} value={fill} onValueChange={setFill} />
 */
export function SegmentedControl<Value extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  disabled,
  className,
  ...rest
}: SegmentedControlProps<Value>): ReactElement {
  const items = options.map(optionOf);
  const first = items[0]?.value;
  const [chosen, choose] = useControllableState<Value | undefined>({
    value,
    defaultValue: defaultValue ?? first,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  return (
    <RadioGroup.Root
      {...rest}
      value={chosen ?? ""}
      onValueChange={(next) => {
        const picked = items.find((item) => item.value === next);
        if (picked) choose(picked.value);
      }}
      orientation="horizontal"
      aria-label={label}
      disabled={disabled}
      className={cx("bt-segmented-control", className)}
      data-bt="SegmentedControl"
      data-bt-control=""
    >
      <SharedIndicator.Group>
        {items.map((item) => (
          <RadioGroup.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            asChild
          >
            <SharedIndicator active={item.value === chosen} asChild>
              <button
                type="button"
                className="bt-press bt-focus"
                data-bt-part="segment"
              >
                <span
                  className="bt-truncate"
                  data-bt-part="label"
                  data-bt-truncate=""
                  title={item.label}
                >
                  {item.label}
                </span>
              </button>
            </SharedIndicator>
          </RadioGroup.Item>
        ))}
      </SharedIndicator.Group>
    </RadioGroup.Root>
  );
}
