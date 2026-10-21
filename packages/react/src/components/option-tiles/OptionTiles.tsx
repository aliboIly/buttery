import { Icon, cx, useControllableState } from "@buttery/core";
import { Check } from "lucide-react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import { useId } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** One tile in `OptionTiles`. */
export interface OptionTile<Value extends string = string> {
  /** What choosing it adds to the value. */
  readonly value: Value;
  /** Its words, in `label`, which name its checkbox. */
  readonly label: string;
  /** A line under the words, which describes its checkbox. */
  readonly description?: string | undefined;
  /** Shows it but stops it being chosen. Defaults to `false`. */
  readonly disabled?: boolean | undefined;
}

/** Props for `OptionTiles`. */
export interface OptionTilesProps<Value extends string = string> extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Names the group for screen readers, such as "What you need". */
  readonly label: string;
  /** The tiles, in order. */
  readonly options: readonly OptionTile<Value>[];
  /** The tiles chosen. Pair with `onValueChange` to control them. */
  readonly value?: readonly Value[] | undefined;
  /** The tiles chosen first when uncontrolled. Defaults to none. */
  readonly defaultValue?: readonly Value[] | undefined;
  /** Called with every tile chosen, in the order of `options`, whenever one is ticked or cleared. */
  readonly onValueChange?: ((value: readonly Value[]) => void) | undefined;
}

/**
 * Several choices at once, as tiles in a grid, two columns from 480px of room: each tile a checkbox with
 * its words (and a line under them), on `bg-control`, r-md, padded 8 and 12 and 40 tall with one line. A press
 * anywhere on a tile ticks it; a chosen tile turns `bg-surface` with a 2px `accent` border, drawn inside
 * its edge so nothing moves.
 *
 * @example
 * <OptionTiles
 *   label="What you need"
 *   options={[{ value: "shop", label: "Sell online" }, { value: "wholesale", label: "Sell to cafés" }]}
 *   value={needs}
 *   onValueChange={setNeeds}
 * />
 */
export function OptionTiles<Value extends string = string>({
  label,
  options,
  value,
  defaultValue = [],
  onValueChange,
  className,
  ...rest
}: OptionTilesProps<Value>): ReactElement {
  const id = useId();
  const [chosen, choose] = useControllableState<readonly Value[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const toggle = (tile: Value, on: boolean): void => {
    const next = new Set(chosen);
    if (on) next.add(tile);
    else next.delete(tile);
    choose(
      options.map((option) => option.value).filter((entry) => next.has(entry)),
    );
  };
  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      className={cx("bt-option-tiles", className)}
      data-bt="OptionTiles"
    >
      <div data-bt-part="grid">
        {options.map((option, index) => {
          const labelId = `${id}-${String(index)}`;
          const descriptionId = `${labelId}-description`;
          return (
            <RadixCheckbox.Root
              key={option.value}
              checked={chosen.includes(option.value)}
              disabled={option.disabled}
              onCheckedChange={(next) => {
                toggle(option.value, next === true);
              }}
              aria-labelledby={labelId}
              aria-describedby={
                option.description === undefined ? undefined : descriptionId
              }
              className="bt-focus"
              data-bt-part="tile"
            >
              <span data-bt-part="box" aria-hidden="true">
                <RadixCheckbox.Indicator data-bt-part="mark">
                  <Icon icon={Check} />
                </RadixCheckbox.Indicator>
              </span>
              <span data-bt-part="text">
                <span id={labelId} className="bt-text" data-role="label">
                  {option.label}
                </span>
                {option.description === undefined ? null : (
                  <span
                    id={descriptionId}
                    className="bt-text"
                    data-role="caption"
                    data-bt-part="description"
                  >
                    {option.description}
                  </span>
                )}
              </span>
            </RadixCheckbox.Root>
          );
        })}
      </div>
    </div>
  );
}
