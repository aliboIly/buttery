import {
  cx,
  spring,
  useAnimationTracking,
  useControllableState,
  useMotionPreference,
  useMergedRefs,
} from "@buttery/core";
import { motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useId, useRef, useState } from "react";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";

/** How far something is tilted: `x` to the right and `y` downwards, each from −1 to 1. */
export interface TiltValue {
  /** Tilt to the right (positive) or left (negative), from −1 to 1. */
  readonly x: number;
  /** Tilt downwards (positive) or upwards (negative), from −1 to 1. */
  readonly y: number;
}

/** The words a `TiltPad` reads out, for other languages. */
export interface TiltPadLabels {
  /** Names the sideways control. */
  readonly x: string;
  /** Names the up-and-down control. */
  readonly y: string;
  /** Says how to use it with the keyboard. */
  readonly hint: string;
  /** Said after a tilt to the left, as in "30% left". */
  readonly left: string;
  /** Said after a tilt to the right. */
  readonly right: string;
  /** Said after an upward tilt. */
  readonly up: string;
  /** Said after a downward tilt. */
  readonly down: string;
  /** Said for no tilt on an axis. */
  readonly level: string;
}

/** Props for `TiltPad`. */
export interface TiltPadProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "children"
> {
  /** What is tilted, such as "Tilt". It names the control. */
  readonly label: string;
  /** The tilt. Pair with `onValueChange` to control it. */
  readonly value?: TiltValue | undefined;
  /** The tilt at first when uncontrolled. Defaults to level. */
  readonly defaultValue?: TiltValue | undefined;
  /** Called with each change: every frame of a drag, each key press, each reset. */
  readonly onValueChange?: ((value: TiltValue) => void) | undefined;
  /** Called when a drag ends or a key changes the tilt, with the tilt it settled on. */
  readonly onValueCommit?: ((value: TiltValue) => void) | undefined;
  /** How far one arrow key press tilts, from 0 to 1. Shift tilts five times as far. Defaults to 0.1. */
  readonly step?: number | undefined;
  /** Keeps it from changing. */
  readonly disabled?: boolean | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<TiltPadLabels> | undefined;
}

const LABELS: TiltPadLabels = {
  x: "Left and right",
  y: "Up and down",
  hint: "Arrow keys tilt it; Backspace sets it level.",
  left: "left",
  right: "right",
  up: "up",
  down: "down",
  level: "level",
};

const LEVEL: TiltValue = { x: 0, y: 0 };
/** How far the pointer travels, in px, to tilt all the way from level. */
const DRAG_SPAN = 48;

function clampAxis(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

/** Keeps a tilt inside the unit circle, so a corner never tilts further than an edge. */
function clampTilt({ x, y }: TiltValue): TiltValue {
  const length = Math.hypot(x, y);
  const scale = length > 1 ? 1 / length : 1;
  const round = (value: number): number => Math.round(value * 1000) / 1000;
  return { x: round(clampAxis(x * scale)), y: round(clampAxis(y * scale)) };
}

/**
 * A 32px pad with a knob for tilting something in 3D, such as a card. Drag the knob, or use the arrow keys
 * (Shift for bigger steps): left and right tilt sideways, up and down tilt up and down, and Backspace,
 * Delete or Home set it level. An accent arc shows on the knob's edge in the direction it's tilted,
 * stronger the further it goes. Dragging follows the pointer at once; other changes glide on
 * `spring.smooth`. Pair it with a `Chip` that resets it.
 *
 * @example
 * <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
 */
export function TiltPad({
  label,
  value,
  defaultValue = LEVEL,
  onValueChange,
  onValueCommit,
  step = 0.1,
  disabled = false,
  labels,
  className,
  ref,
  ...rest
}: TiltPadProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const [tilt, setTilt] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [dragging, setDragging] = useState(false);
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const root = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const xInput = useRef<HTMLInputElement>(null);
  const yInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    readonly x: number;
    readonly y: number;
    readonly from: TiltValue;
  } | null>(null);
  const latest = useRef(tilt);
  const pending = useRef<TiltValue | null>(null);
  const frame = useRef(0);
  const hintId = useId();

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  const describe = (
    amount: number,
    negative: string,
    positive: string,
  ): string =>
    amount === 0
      ? words.level
      : `${String(Math.round(Math.abs(amount) * 100))}% ${amount < 0 ? negative : positive}`;

  const change = (next: TiltValue, commit: boolean): void => {
    const clamped = clampTilt(next);
    latest.current = clamped;
    setTilt(clamped);
    if (commit) onValueCommit?.(clamped);
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, from: tilt };
    latest.current = tilt;
    setDragging(true);
    xInput.current?.focus({ preventScroll: true });
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>): void => {
    const start = drag.current;
    if (!start) return;
    const next = {
      x: start.from.x + (event.clientX - start.x) / DRAG_SPAN,
      y: start.from.y + (event.clientY - start.y) / DRAG_SPAN,
    };
    pending.current = next;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(applyPending);
  };
  const applyPending = (): void => {
    if (!pending.current) return;
    change(pending.current, false);
    pending.current = null;
  };
  const endDrag = (): void => {
    if (!drag.current) return;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    applyPending();
    setDragging(false);
    onValueCommit?.(latest.current);
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) return;
    const amount = event.shiftKey ? step * 5 : step;
    const next = ((): {
      readonly value: TiltValue;
      readonly axis: "x" | "y";
    } | null => {
      switch (event.key) {
        case "ArrowRight":
          return { value: { ...tilt, x: tilt.x + amount }, axis: "x" };
        case "ArrowLeft":
          return { value: { ...tilt, x: tilt.x - amount }, axis: "x" };
        case "ArrowDown":
          return { value: { ...tilt, y: tilt.y + amount }, axis: "y" };
        case "ArrowUp":
          return { value: { ...tilt, y: tilt.y - amount }, axis: "y" };
        case "Home":
        case "Backspace":
        case "Delete":
          return {
            value: LEVEL,
            axis: event.currentTarget === yInput.current ? "y" : "x",
          };
        default:
          return null;
      }
    })();
    if (!next) return;
    event.preventDefault();
    change(next.value, true);
    (next.axis === "x" ? xInput : yInput).current?.focus({
      preventScroll: true,
    });
  };

  const live = dragging || reduced;
  return (
    <div
      {...rest}
      ref={refs}
      role="group"
      aria-label={label}
      className={cx("bt-tilt-pad", className)}
      data-bt="TiltPad"
      data-dragging={dragging ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onLostPointerCapture={endDrag}
    >
      <motion.span
        {...tracking}
        data-bt-part="knob"
        aria-hidden="true"
        initial={false}
        animate={{ "--bt-tilt-pad-x": tilt.x, "--bt-tilt-pad-y": tilt.y }}
        transition={live ? spring.instant : spring.smooth}
      >
        <span data-bt-part="arc" />
      </motion.span>
      <VisuallyHidden.Root asChild>
        <input
          ref={xInput}
          type="range"
          min={-100}
          max={100}
          step={Math.round(step * 100)}
          value={Math.round(tilt.x * 100)}
          disabled={disabled}
          aria-label={words.x}
          aria-describedby={hintId}
          aria-valuetext={describe(tilt.x, words.left, words.right)}
          onKeyDown={keyDown}
          onChange={(event) => {
            change({ ...tilt, x: Number(event.target.value) / 100 }, true);
          }}
        />
      </VisuallyHidden.Root>
      <VisuallyHidden.Root asChild>
        <input
          ref={yInput}
          type="range"
          tabIndex={-1}
          min={-100}
          max={100}
          step={Math.round(step * 100)}
          value={Math.round(tilt.y * 100)}
          disabled={disabled}
          aria-label={words.y}
          aria-describedby={hintId}
          aria-valuetext={describe(tilt.y, words.up, words.down)}
          onKeyDown={keyDown}
          onChange={(event) => {
            change({ ...tilt, y: Number(event.target.value) / 100 }, true);
          }}
        />
      </VisuallyHidden.Root>
      <VisuallyHidden.Root id={hintId}>{words.hint}</VisuallyHidden.Root>
    </div>
  );
}
