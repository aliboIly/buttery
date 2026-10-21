import { cx, useControllableState, useMergedRefs } from "@buttery/core";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `ColorDot`. `ref` and other input props go to the color input; `className` and `style` to the label around the dot. */
export interface ColorDotProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "size" | "children"
> {
  /** What the color is for, such as "First hue". It names the control. */
  readonly label: string;
  /** The color, as `#rrggbb`. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The color at first when uncontrolled, as `#rrggbb`. Defaults to black. */
  readonly defaultValue?: string | undefined;
  /** Called with each color picked, as `#rrggbb`, while the picker is open. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Called once the picker closes on a new color, for one undo step per pick rather than per color passed. */
  readonly onValueCommit?: ((value: string) => void) | undefined;
}

/**
 * A 24px round swatch showing a color; pressing it opens the system color picker. A 28px circle around
 * it takes the press, and keyboard focus rings the dot. Put two side by side, 6px apart (`gap={1.5}`),
 * with an `IconButton` to swap them, for a gradient's colors.
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
  className,
  style,
  disabled,
  ref,
  ...rest
}: ColorDotProps): ReactElement {
  const [color, setColor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const input = useRef<HTMLInputElement>(null);
  const refs = useMergedRefs(ref, input);

  useEffect(() => {
    const element = input.current;
    if (!element || !onValueCommit) return undefined;
    const commit = (): void => {
      onValueCommit(element.value);
    };
    element.addEventListener("change", commit);
    return () => {
      element.removeEventListener("change", commit);
    };
  }, [onValueCommit]);
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
          ref={refs}
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
      <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
    </label>
  );
}
