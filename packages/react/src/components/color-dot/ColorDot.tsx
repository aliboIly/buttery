import { cx, useControllableState } from "@buttery/core";
import { VisuallyHidden } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `ColorDot`. `ref` and other input props go to the color input; `className` and `style` to the dot. */
export interface ColorDotProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "size" | "children"
> {
  /** What the color is for, such as "Start color". It names the control. */
  readonly label: string;
  /** The color, as `#rrggbb`. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The color at first when uncontrolled, as `#rrggbb`. Defaults to black. */
  readonly defaultValue?: string | undefined;
  /** Called with each color picked, as `#rrggbb`, while the picker is open. */
  readonly onValueChange?: ((value: string) => void) | undefined;
}

/**
 * A 22px round swatch showing a color; pressing it opens the system color picker. The whole 28px circle
 * around it takes the press, and keyboard focus rings the dot. Put two side by side, 6px apart, with an
 * `IconButton` to swap them, for a gradient's colors.
 *
 * @example
 * <ColorDot label="Start color" value={from} onValueChange={setFrom} />
 */
export function ColorDot({
  label,
  value,
  defaultValue = "#000000",
  onValueChange,
  className,
  style,
  disabled,
  ...rest
}: ColorDotProps): ReactElement {
  const [color, setColor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  return (
    <label
      className={cx("bt-color-dot", className)}
      style={style}
      title={label}
      data-bt="ColorDot"
      data-disabled={disabled ? "" : undefined}
    >
      <VisuallyHidden.Root asChild>
        <input
          {...rest}
          type="color"
          value={color}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => {
            setColor(event.target.value);
          }}
        />
      </VisuallyHidden.Root>
      <span
        data-bt-part="dot"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    </label>
  );
}
