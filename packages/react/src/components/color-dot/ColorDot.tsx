import { Popover, cx, useControllableState } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { ColorPicker } from "../color-picker/ColorPicker.tsx";
import type { ColorPickerLabels } from "../color-picker/ColorPicker.tsx";

/** Props for `ColorDot`. `ref` and other button props go to the dot. */
export interface ColorDotProps extends Omit<
  ComponentPropsWithRef<"button">,
  "value" | "defaultValue" | "onChange" | "children"
> {
  /** What the color is for, such as "First hue". It names the dot and its picker. */
  readonly label: string;
  /** The color, as `#rrggbb`. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The color at first when uncontrolled, as `#rrggbb`. Defaults to black. */
  readonly defaultValue?: string | undefined;
  /** Called with each change in the picker, as `#rrggbb`, every frame of a drag included. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Called when a drag in the picker ends, or a key, a typed code or a preset changes the color: one undo step per change rather than per frame. */
  readonly onValueCommit?: ((value: string) => void) | undefined;
  /** Whether the picker is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the picker starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the picker opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Colors to pick in one press, as `#rrggbb`, shown in the picker under its code field. */
  readonly presets?: readonly string[] | undefined;
  /** Words for the picker to use instead of the English ones. */
  readonly labels?: Partial<ColorPickerLabels> | undefined;
}

/**
 * A 24px round swatch showing a color; pressing it opens buttery's `ColorPicker` in a popover beside it,
 * and Escape or a press outside closes it with focus back on the dot. A 28px circle around the dot takes
 * the press. Put two side by side, 6px apart (`gap={1.5}`), with an `IconButton` to swap them, for a
 * gradient's colors.
 *
 * @example
 * <ColorDot label="First hue" value={from} onValueChange={setFrom} />
 */
export function ColorDot({
  label,
  value,
  defaultValue = "#000000",
  onValueChange,
  onValueCommit,
  open,
  defaultOpen = false,
  onOpenChange,
  presets,
  labels,
  className,
  disabled,
  ...rest
}: ColorDotProps): ReactElement {
  const [color, setColor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          {...rest}
          type="button"
          disabled={disabled}
          aria-label={`${label}, ${color}`}
          title={label}
          className={cx("bt-color-dot", className)}
          data-bt="ColorDot"
          data-disabled={disabled ? "" : undefined}
        >
          <span
            data-bt-part="dot"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Content aria-label={label} className="bt-color-dot-panel">
        <ColorPicker
          label={label}
          value={color}
          onValueChange={setColor}
          onValueCommit={onValueCommit}
          presets={presets}
          labels={labels}
        />
      </Popover.Content>
    </Popover>
  );
}
