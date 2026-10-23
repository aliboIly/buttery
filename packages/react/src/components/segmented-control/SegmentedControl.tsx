import {
  Icon,
  SharedIndicator,
  cx,
  useControllableState,
} from "@butteryui/core";
import type { IconComponentProps } from "@butteryui/core";
import { RadioGroup } from "radix-ui";
import type { ComponentPropsWithRef, ComponentType, ReactElement } from "react";
import { Tooltip } from "../tooltip/Tooltip.tsx";

/** One option of a `SegmentedControl`. */
export interface SegmentedControlOption<Value extends string> {
  /** What `value` and `onValueChange` carry. */
  readonly value: Value;
  /** What the segment says. */
  readonly label: string;
  /** Keeps the segment from being chosen. */
  readonly disabled?: boolean | undefined;
  /** An icon before the label, or in its place with `iconOnly`. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
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
  /** What the choice is about, for screen readers, such as "Picture fit". */
  readonly label: string;
  /** Keeps every segment from being chosen. */
  readonly disabled?: boolean | undefined;
  /** Shows each option's icon in place of its label, which becomes its tooltip and name. Give every option an icon. */
  readonly iconOnly?: boolean | undefined;
  /**
   * The track's height: `"md"` (34px, 30 compact, the default), `"sm"` (28px) for a toolbar or a dense panel, or
   * `"lg"` (48px, 40 compact) beside 48px buttons and fields.
   */
  readonly size?: "sm" | "md" | "lg" | undefined;
  /**
   * `"hug"` (the default) keeps the control as wide as its segments wherever it's placed, even in a `Stack` or a
   * grid cell that stretches its children; `"fill"` spans the width it's given, its segments sharing it equally.
   */
  readonly layout?: "hug" | "fill" | undefined;
}

function optionOf<Value extends string>(
  option: Value | SegmentedControlOption<Value>,
): SegmentedControlOption<Value> {
  return typeof option === "string" ? { value: option, label: option } : option;
}

/**
 * One choice out of a few, shown side by side in a track, with the selection sliding between them. One
 * segment is always chosen; arrow keys move the choice. Segments share one width, the widest label's, and the
 * track hugs them unless `layout="fill"` spreads them across the width it's given.
 *
 * @example
 * <SegmentedControl label="Fill" options={["Gradient", "Color"]} value={fill} onValueChange={setFill} />
 */
export function SegmentedControl<Value extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  disabled,
  iconOnly = false,
  size = "md",
  layout = "hug",
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
      data-bt="SegmentedControl"
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
      data-bt-control=""
      data-size={size}
      data-layout={layout}
      data-icon-only={iconOnly ? "" : undefined}
    >
      <SharedIndicator.Group>
        {items.map((item) => {
          const segment = (
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
                  aria-label={iconOnly && item.icon ? item.label : undefined}
                  data-bt-part="segment"
                >
                  {item.icon ? <Icon icon={item.icon} /> : null}
                  {iconOnly && item.icon ? null : (
                    <span
                      className="bt-truncate"
                      data-bt-part="label"
                      data-bt-truncate=""
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              </SharedIndicator>
            </RadioGroup.Item>
          );
          return iconOnly && item.icon ? (
            <Tooltip key={item.value} label={item.label}>
              {segment}
            </Tooltip>
          ) : (
            segment
          );
        })}
      </SharedIndicator.Group>
    </RadioGroup.Root>
  );
}
