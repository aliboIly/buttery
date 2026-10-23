import {
  SharedIndicator,
  cx,
  useControllableState,
  useMergedRefs,
} from "@butteryui/core";
import { useRef } from "react";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";

/** Where something sits: a corner, the middle of an edge, or the center. */
export type Anchor =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

/** Every anchor, row by row from the top left. */
export const anchors: readonly Anchor[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

const NAMES: Readonly<Record<Anchor, string>> = {
  "top-left": "Top left",
  top: "Top",
  "top-right": "Top right",
  left: "Left",
  center: "Center",
  right: "Right",
  "bottom-left": "Bottom left",
  bottom: "Bottom",
  "bottom-right": "Bottom right",
};

/** Props for `AnchorGrid`. */
export interface AnchorGridProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "children"
> {
  /** What the anchor places, such as "Anchor". It names the group. */
  readonly label: string;
  /** The chosen anchor. Pair with `onValueChange` to control it. */
  readonly value?: Anchor | undefined;
  /** The anchor at first when uncontrolled. Defaults to `"center"`. */
  readonly defaultValue?: Anchor | undefined;
  /** Called with the anchor chosen. */
  readonly onValueChange?: ((value: Anchor) => void) | undefined;
  /** Keeps it from changing. */
  readonly disabled?: boolean | undefined;
  /** Each anchor's name for screen readers, for other languages. */
  readonly labels?: Partial<Record<Anchor, string>> | undefined;
}

/**
 * A 43px box with a 3×3 grid of dots for picking where something sits. It works like radio buttons: the
 * arrow keys move between the dots in two dimensions, choosing as they go, and Home and End reach the
 * corners. The chosen dot is a knob that slides to the next on `spring.snappy`. The whole box takes a
 * press, which picks the nearest dot, since a single dot is too small to aim at.
 *
 * @example
 * <AnchorGrid label="Anchor" value={anchor} onValueChange={setAnchor} />
 */
export function AnchorGrid({
  label,
  value,
  defaultValue = "center",
  onValueChange,
  disabled = false,
  labels,
  className,
  onPointerDown,
  ref,
  ...rest
}: AnchorGridProps): ReactElement {
  const names = { ...NAMES, ...labels };
  const [anchor, setAnchor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const box = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, box);

  const cells = (): HTMLElement[] => [
    ...(box.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []),
  ];
  const choose = (index: number): void => {
    const next = anchors[index];
    if (!next || disabled) return;
    setAnchor(next);
    cells()[index]?.focus({ preventScroll: true });
  };

  const pickNearest = (event: PointerEvent<HTMLDivElement>): void => {
    onPointerDown?.(event);
    if (disabled || event.button !== 0 || event.defaultPrevented) return;
    event.preventDefault();
    const distances = cells().map((cell) => {
      const rect = cell.getBoundingClientRect();
      return Math.hypot(
        rect.left + rect.width / 2 - event.clientX,
        rect.top + rect.height / 2 - event.clientY,
      );
    });
    choose(distances.indexOf(Math.min(...distances)));
  };

  const keyDown =
    (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
      const row = Math.floor(index / 3);
      const column = index % 3;
      const target = ((): number | null => {
        switch (event.key) {
          case "ArrowRight":
            return column < 2 ? index + 1 : index;
          case "ArrowLeft":
            return column > 0 ? index - 1 : index;
          case "ArrowDown":
            return row < 2 ? index + 3 : index;
          case "ArrowUp":
            return row > 0 ? index - 3 : index;
          case "Home":
            return 0;
          case "End":
            return anchors.length - 1;
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
      className={cx("bt-anchor-grid", className)}
      data-bt="AnchorGrid"
      data-bt-target="group"
      data-disabled={disabled ? "" : undefined}
      onPointerDown={pickNearest}
    >
      <SharedIndicator.Group>
        {anchors.map((cell, index) => (
          <SharedIndicator key={cell} active={cell === anchor} asChild>
            <button
              type="button"
              role="radio"
              aria-checked={cell === anchor}
              aria-label={names[cell]}
              tabIndex={cell === anchor ? 0 : -1}
              disabled={disabled}
              data-bt-part="cell"
              onClick={() => {
                choose(index);
              }}
              onKeyDown={keyDown(index)}
            >
              <span data-bt-part="dot" aria-hidden="true" />
            </button>
          </SharedIndicator>
        ))}
      </SharedIndicator.Group>
    </div>
  );
}
