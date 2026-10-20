import { Text, cx, useControllableState } from "@buttery/core";
import { Slider as RadixSlider } from "radix-ui";
import { useId, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { ValueBadge } from "../value-badge/ValueBadge.tsx";

/** How a slider writes its value: a unit after the number, or your own function. */
export type SliderFormat = "%" | "°" | "px" | ((value: number) => string);

/** Props for `Slider`. */
export interface SliderProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "dir" | "children"
> {
  /** What the slider sets, shown beside its value and used as its name. */
  readonly label: string;
  /** The value. Pair with `onValueChange` to control it. */
  readonly value?: number | undefined;
  /** The starting value when uncontrolled. Defaults to `min`. */
  readonly defaultValue?: number | undefined;
  /** Called on every change, frame by frame while dragging. */
  readonly onValueChange?: ((value: number) => void) | undefined;
  /** Called once the user lets go of the thumb or finishes a key press. */
  readonly onValueCommit?: ((value: number) => void) | undefined;
  /** The lowest value. Defaults to 0. */
  readonly min?: number | undefined;
  /** The highest value. Defaults to 100. */
  readonly max?: number | undefined;
  /** The smallest change. Arrow keys move one step, Shift and an arrow ten. Defaults to 1. */
  readonly step?: number | undefined;
  /**
   * What a double-click on the label or the badge, or Backspace or Delete on the thumb, resets to. Defaults
   * to `defaultValue`, then `min`.
   */
  readonly resetValue?: number | undefined;
  /** Values a drag snaps to when it passes within 2% of the range, such as 0 for a rotation. */
  readonly detents?: readonly number[] | undefined;
  /** How the badge and screen readers write the value: `"%"`, `"°"`, `"px"` or a function. */
  readonly format?: SliderFormat | undefined;
  /** Fills the track up to the thumb. Off by default. */
  readonly showRange?: boolean | undefined;
  /** Keeps the value from changing. */
  readonly disabled?: boolean | undefined;
}

const DETENT_PULL = 0.02;

function formatterFor(
  format: SliderFormat | undefined,
  step: number,
): (value: number) => string {
  if (typeof format === "function") return format;
  const decimals = (String(step).split(".")[1] ?? "").length;
  const unit = format ?? "";
  return (value) => `${value.toFixed(decimals)}${unit}`;
}

/**
 * A labeled slider row: the label and its value badge beside a track you drag, click or step with the
 * keyboard. The value follows the pointer directly, with no easing. A double-click on the label or the
 * badge resets it, as do Backspace and Delete on the thumb.
 *
 * @example
 * <Slider label="Rotation" min={-180} max={180} format="°" detents={[0]} value={angle} onValueChange={setAngle} />
 */
export function Slider({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  resetValue,
  detents = [],
  format,
  showRange = false,
  disabled = false,
  className,
  ...rest
}: SliderProps): ReactElement {
  const labelId = useId();
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const dragging = useRef(false);
  const write = formatterFor(format, step);
  const reset = (): void => {
    if (!disabled) setCurrent(resetValue ?? defaultValue ?? min);
  };
  const pull = (max - min) * DETENT_PULL;

  return (
    <div
      {...rest}
      className={cx("bt-slider", className)}
      data-bt="Slider"
      data-disabled={disabled ? "" : undefined}
    >
      <div data-bt-part="caption">
        <Text id={labelId} truncate data-bt-part="label" onDoubleClick={reset}>
          {label}
        </Text>
        <ValueBadge reserve={[write(min), write(max)]} onDoubleClick={reset}>
          {write(current)}
        </ValueBadge>
      </div>
      <RadixSlider.Root
        value={[current]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onPointerDown={() => {
          dragging.current = true;
        }}
        onValueChange={([next]) => {
          if (next === undefined) return;
          const detent = dragging.current
            ? detents.find((candidate) => Math.abs(next - candidate) <= pull)
            : undefined;
          setCurrent(detent ?? next);
        }}
        onValueCommit={([committed]) => {
          dragging.current = false;
          if (committed !== undefined) onValueCommit?.(committed);
        }}
        className="bt-slider-control"
        data-bt-part="control"
      >
        <RadixSlider.Track data-bt-part="track">
          {showRange ? <RadixSlider.Range data-bt-part="range" /> : null}
        </RadixSlider.Track>
        <RadixSlider.Thumb
          aria-labelledby={labelId}
          aria-valuetext={write(current)}
          onKeyDown={(event) => {
            if (event.key !== "Backspace" && event.key !== "Delete") return;
            event.preventDefault();
            reset();
          }}
          className="bt-focus"
          data-bt-part="thumb"
        >
          <span data-bt-part="grip" aria-hidden="true">
            <span />
            <span />
          </span>
          <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
        </RadixSlider.Thumb>
      </RadixSlider.Root>
    </div>
  );
}
