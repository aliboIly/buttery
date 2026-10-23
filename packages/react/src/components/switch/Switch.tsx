import {
  cx,
  hasContent,
  useAnimationTracking,
  useControllableState,
  useLayoutAnimation,
} from "@butteryui/core";
import { motion } from "motion/react";
import { Switch as RadixSwitch } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useFormFieldIds } from "../../parts/form-field/FormFieldParts.tsx";

/** Props for `Switch`. `ref` and other button props go to the switch; `className` and `style` to the field. */
export interface SwitchProps extends Omit<
  ComponentPropsWithRef<"button">,
  "value" | "defaultValue" | "defaultChecked" | "onChange" | "children" | "type"
> {
  /** What it turns on, beside the switch. Pressing it flips the switch too. */
  readonly label: ReactNode;
  /** A hint under the label. */
  readonly hint?: ReactNode;
  /** Whether it's on. Pair with `onCheckedChange` to control it. */
  readonly checked?: boolean | undefined;
  /** Whether it starts on when uncontrolled. Defaults to `false`. */
  readonly defaultChecked?: boolean | undefined;
  /** Called when it's turned on or off. */
  readonly onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** What it submits in a form while it's on. Defaults to `"on"`. */
  readonly value?: string | undefined;
  /**
   * `"md"` (the default), a 32×20 track beside a `label`-role label, or `"sm"`, a 26×16 track beside 13px words,
   * for dense lists such as a table's settings. Its target stays 24px tall either way.
   */
  readonly size?: "sm" | "md" | undefined;
}

/**
 * A switch for a setting that takes effect at once, with its label beside it, at `md` or a smaller `sm`. Its
 * thumb slides on `spring.snappy` and jumps with reduced motion. For a choice that waits for a Save, use
 * `Checkbox`.
 *
 * @example
 * <Switch label="Snap to the grid" checked={snap} onCheckedChange={setSnap} />
 */
export function Switch({
  label,
  hint,
  checked,
  defaultChecked,
  onCheckedChange,
  size = "md",
  id,
  className,
  style,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: SwitchProps): ReactElement {
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });
  const layout = useLayoutAnimation("snappy", "position");
  const tracking = useAnimationTracking();
  const ids = useFormFieldIds({
    id,
    describedBy,
    hint: hasContent(hint),
    error: false,
  });
  return (
    <div
      className={cx("bt-switch bt-form-field", className)}
      style={style}
      data-bt="Switch"
      data-size={size}
      data-disabled={disabled ? "" : undefined}
    >
      <div data-bt-part="row">
        <RadixSwitch.Root
          {...rest}
          id={ids.control}
          checked={on}
          onCheckedChange={setOn}
          disabled={disabled}
          aria-describedby={ids.describedBy}
          className="bt-focus"
          data-bt-part="track"
        >
          <RadixSwitch.Thumb asChild>
            <motion.span
              {...tracking}
              {...layout}
              layoutDependency={on}
              data-bt-part="thumb"
            />
          </RadixSwitch.Thumb>
          <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
        </RadixSwitch.Root>
        <label
          htmlFor={ids.control}
          className="bt-text"
          data-role={size === "sm" ? "control" : "label"}
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
    </div>
  );
}
