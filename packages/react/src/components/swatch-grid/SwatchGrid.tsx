import { cx, useControllableState, useMergedRefs } from "@butteryui/core";
import type { CssVariables } from "@butteryui/core";
import { useRef } from "react";
import type {
  CSSProperties,
  ComponentPropsWithRef,
  KeyboardEvent,
  ReactElement,
} from "react";

/** One swatch: a value to choose, its name and how it's painted. */
export interface Swatch<Value extends string = string> {
  /** What choosing it sets the grid's value to. */
  readonly value: Value;
  /** Its name for screen readers and the tooltip, such as "Peach". */
  readonly label: string;
  /** A CSS background: a color, or a gradient from `gradientCss` in `@butteryui/core/palettes`. */
  readonly fill: string;
}

/** Props for `SwatchGrid`. */
export interface SwatchGridProps<Value extends string = string> extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "children"
> {
  /** What the swatches choose, such as "Background". It names the group. */
  readonly label: string;
  /** The swatches, row by row. */
  readonly swatches: readonly Swatch<Value>[];
  /** The chosen swatch's value. Pair with `onValueChange` to control it. */
  readonly value?: Value | undefined;
  /** The value chosen at first when uncontrolled. */
  readonly defaultValue?: Value | undefined;
  /** Called with the value of the swatch chosen. */
  readonly onValueChange?: ((value: Value) => void) | undefined;
  /** Swatches per row. Defaults to 6. */
  readonly columns?: 4 | 5 | 6 | 7 | 8 | undefined;
  /** Keeps every swatch from being chosen. */
  readonly disabled?: boolean | undefined;
}

/**
 * A grid of swatches to pick one from, like radio buttons: a press or Space chooses, the arrow keys move
 * across a row and up and down a column, choosing as they go, and Home and End reach the first and last.
 * The chosen swatch gets the selection ring at once; nothing animates.
 *
 * @example
 * <SwatchGrid
 *   label="Background"
 *   value={background}
 *   onValueChange={setBackground}
 *   swatches={gradients.map((preset) => ({ value: preset.id, label: preset.name, fill: gradientCss(preset) }))}
 * />
 */
export function SwatchGrid<Value extends string = string>({
  label,
  swatches,
  value,
  defaultValue,
  onValueChange,
  columns = 6,
  disabled = false,
  className,
  style,
  ref,
  ...rest
}: SwatchGridProps<Value>): ReactElement {
  const [chosen, setChosen] = useControllableState<Value | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const grid = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, grid);
  const columnStyle: CSSProperties & CssVariables = {
    ...style,
    "--bt-swatch-grid-columns": String(columns),
  };
  const chosenIndex = swatches.findIndex((swatch) => swatch.value === chosen);
  const tabStop = chosenIndex === -1 ? 0 : chosenIndex;

  const choose = (index: number): void => {
    const swatch = swatches[index];
    if (!swatch || disabled) return;
    setChosen(swatch.value);
    const buttons =
      grid.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    buttons?.[index]?.focus();
  };

  const keyDown =
    (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
      const last = swatches.length - 1;
      const target = ((): number | null => {
        switch (event.key) {
          case "ArrowRight":
            return index === last ? 0 : index + 1;
          case "ArrowLeft":
            return index === 0 ? last : index - 1;
          case "ArrowDown":
            return index + columns <= last ? index + columns : index;
          case "ArrowUp":
            return index - columns >= 0 ? index - columns : index;
          case "Home":
            return 0;
          case "End":
            return last;
          default:
            return null;
        }
      })();
      if (target === null) return;
      event.preventDefault();
      choose(target);
    };

  return (
    <div
      {...rest}
      ref={refs}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cx("bt-swatch-grid", className)}
      style={columnStyle}
      data-bt="SwatchGrid"
      data-disabled={disabled ? "" : undefined}
    >
      {swatches.map((swatch, index) => (
        <button
          key={swatch.value}
          type="button"
          role="radio"
          aria-checked={swatch.value === chosen}
          aria-label={swatch.label}
          title={swatch.label}
          tabIndex={index === tabStop ? 0 : -1}
          disabled={disabled}
          className="bt-focus"
          style={{ background: swatch.fill }}
          data-bt-part="swatch"
          onClick={() => {
            choose(index);
          }}
          onKeyDown={keyDown(index)}
        />
      ))}
    </div>
  );
}
