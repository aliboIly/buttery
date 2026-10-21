import { Icon, cx, useControllableState } from "@buttery/core";
import { Minus, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";

/** Props for `NumberField`. `ref`, `id` and other input props go to the input; `className` and `style` to the field. */
export interface NumberFieldProps extends Omit<
  ComponentPropsWithRef<"input">,
  | "value"
  | "defaultValue"
  | "onChange"
  | "type"
  | "min"
  | "max"
  | "step"
  | "size"
  | "children"
> {
  /** What the number is, shown before the field. Drag it sideways to scrub the value. */
  readonly label: string;
  /** The value. Pair with `onValueChange` to control it. */
  readonly value?: number | undefined;
  /** The starting value when uncontrolled. Defaults to `min`, or 0. */
  readonly defaultValue?: number | undefined;
  /** Called with each committed value: on Enter, on leaving the field, on a step and while scrubbing. */
  readonly onValueChange?: ((value: number) => void) | undefined;
  /**
   * Called once a change is final: on Enter, on leaving the field, on a step, and when a scrub ends, for
   * an undo step per change rather than per scrubbed frame.
   */
  readonly onValueCommit?: ((value: number) => void) | undefined;
  /** The lowest value. */
  readonly min?: number | undefined;
  /** The highest value. */
  readonly max?: number | undefined;
  /** The smallest change. Arrow keys and the stepper move one step, Shift ten. Defaults to 1. */
  readonly step?: number | undefined;
  /** A unit shown after the number, such as `"px"`. */
  readonly unit?: string | undefined;
  /**
   * Where the label sits: `"side"` (the default), before a 128px field, or `"top"`, above a field that
   * fills its column, as in a pair of width and height fields.
   */
  readonly labelPosition?: "side" | "top" | undefined;
}

const SCRUB_PIXELS_PER_STEP = 2;

function decimalsOf(step: number): number {
  return (String(step).split(".")[1] ?? "").length;
}

/**
 * A small field for an exact number, with arrow-key steps, a stepper on hover and scrubbing by dragging
 * its label. Typing only changes the value when it's committed: Enter or leaving the field commits,
 * Escape puts back what was there.
 *
 * @example
 * <NumberField label="W" unit="px" min={1} value={width} onValueChange={setWidth} />
 */
export function NumberField({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min,
  max,
  step = 1,
  unit,
  labelPosition = "side",
  disabled,
  readOnly,
  className,
  style,
  onKeyDown,
  onBlur,
  id,
  ...rest
}: NumberFieldProps): ReactElement {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? min ?? 0,
    onChange: onValueChange,
  });
  const decimals = decimalsOf(step);
  const shown = current.toFixed(decimals);
  const [draft, setDraft] = useState<string | null>(null);
  const frame = useRef(0);
  const scrub = useRef<{
    readonly x: number;
    readonly from: number;
    next: number | null;
  } | null>(null);
  const locked = disabled === true || readOnly === true;

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  const settle = (next: number): number => {
    const rounded = Number((Math.round(next / step) * step).toFixed(decimals));
    return Math.min(max ?? rounded, Math.max(min ?? rounded, rounded));
  };
  const commit = (next: number, final = true): void => {
    const settled = settle(next);
    setDraft(null);
    setCurrent(settled);
    if (final) onValueCommit?.(settled);
  };
  const commitDraft = (): void => {
    if (draft === null) return;
    const parsed = Number.parseFloat(draft.replace(",", "."));
    if (Number.isNaN(parsed)) setDraft(null);
    else commit(parsed);
  };
  const typed = (): number => {
    if (draft === null) return current;
    const parsed = Number.parseFloat(draft.replace(",", "."));
    return Number.isNaN(parsed) ? current : parsed;
  };
  const stepBy = (direction: 1 | -1, large: boolean): void => {
    if (!locked) commit(typed() + direction * step * (large ? 10 : 1));
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    // A popover around the field prevents the first Escape so it can put the field back first.
    if (event.key === "Escape" && draft !== null) {
      setDraft(null);
      return;
    }
    if (event.defaultPrevented) return;
    if (event.key === "Enter") commitDraft();
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(event.key === "ArrowUp" ? 1 : -1, event.shiftKey);
    }
  };

  const startScrub = (event: PointerEvent<HTMLLabelElement>): void => {
    if (locked || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrub.current = { x: event.clientX, from: current, next: null };
  };
  const moveScrub = (event: PointerEvent<HTMLLabelElement>): void => {
    const start = scrub.current;
    if (!start) return;
    const steps = Math.round((event.clientX - start.x) / SCRUB_PIXELS_PER_STEP);
    const next = start.from + steps * step * (event.shiftKey ? 10 : 1);
    start.next = next;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      commit(next, false);
    });
  };
  const endScrub = (): void => {
    const start = scrub.current;
    scrub.current = null;
    if (start?.next == null) return;
    cancelAnimationFrame(frame.current);
    commit(start.next);
  };

  return (
    <div
      className={cx("bt-number-field", className)}
      style={style}
      data-bt="NumberField"
      data-label-position={labelPosition}
      data-disabled={disabled ? "" : undefined}
    >
      <label
        htmlFor={inputId}
        className="bt-text bt-truncate"
        data-role="control"
        data-bt-part="label"
        data-bt-truncate=""
        title={label}
        onPointerDown={startScrub}
        onPointerMove={moveScrub}
        onPointerUp={endScrub}
        onLostPointerCapture={endScrub}
      >
        {label}
      </label>
      <span data-bt-part="field" data-bt-control="">
        <input
          {...rest}
          id={inputId}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          autoComplete="off"
          disabled={disabled}
          readOnly={readOnly}
          value={draft ?? shown}
          data-bt-draft={draft === null ? undefined : ""}
          aria-valuenow={current}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={unit ? `${shown} ${unit}` : shown}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onKeyDown={keyDown}
          onBlur={(event) => {
            commitDraft();
            onBlur?.(event);
          }}
          data-bt-part="input"
        />
        {unit ? (
          <span data-bt-part="unit" aria-hidden="true">
            {unit}
          </span>
        ) : null}
        <span data-bt-part="stepper">
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Decrease ${label}`}
            disabled={locked || (min !== undefined && current <= min)}
            onClick={(event) => {
              stepBy(-1, event.shiftKey);
            }}
            data-bt-part="step"
          >
            <Icon icon={Minus} />
            <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Increase ${label}`}
            disabled={locked || (max !== undefined && current >= max)}
            onClick={(event) => {
              stepBy(1, event.shiftKey);
            }}
            data-bt-part="step"
          >
            <Icon icon={Plus} />
            <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
          </button>
        </span>
      </span>
    </div>
  );
}
