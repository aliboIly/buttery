import {
  AnimationTrackingContext,
  cx,
  formatHex,
  hsvToRgb,
  isHex,
  parseHex,
  rgbToHsv,
  spring,
  trackAnimation,
  useControllableState,
  useMotionPreference,
} from "@butteryui/core";
import type { Hsv } from "@butteryui/core";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import type { MotionStyle, MotionValue } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { use, useEffect, useId, useRef, useState } from "react";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";
import { SwatchGrid } from "../swatch-grid/SwatchGrid.tsx";
import type { Swatch } from "../swatch-grid/SwatchGrid.tsx";

/** The words a `ColorPicker` reads out, for other languages. */
export interface ColorPickerLabels {
  /** Names the area's left-and-right control. */
  readonly saturation: string;
  /** Names the area's up-and-down control. */
  readonly brightness: string;
  /** Names the hue track. */
  readonly hue: string;
  /** Names the hex code field. */
  readonly code: string;
  /** Names the presets. */
  readonly presets: string;
  /** Says how to use the area with the keyboard. */
  readonly hint: string;
}

/** Props for `ColorPicker`. */
export interface ColorPickerProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange" | "children"
> {
  /** What the color is for, such as "Background hue". It names the picker. */
  readonly label: string;
  /** The color, as `#rrggbb`. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The color at first when uncontrolled, as `#rrggbb`. Defaults to black. */
  readonly defaultValue?: string | undefined;
  /** Called with each change, as `#rrggbb`: every frame of a drag, each key press, each code or preset. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Called when a drag ends, or a key, a typed code or a preset changes the color, with the color it settled on. */
  readonly onValueCommit?: ((value: string) => void) | undefined;
  /** Colors to pick in one press, as `#rrggbb`, shown in rows of six under the code. */
  readonly presets?: readonly string[] | undefined;
  /** Keeps it from changing. */
  readonly disabled?: boolean | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<ColorPickerLabels> | undefined;
}

const LABELS: ColorPickerLabels = {
  saturation: "Saturation",
  brightness: "Brightness",
  hue: "Hue",
  code: "Hex code",
  presets: "Presets",
  hint: "Left and right set the saturation, up and down the brightness.",
};

/** Black and white over the hue: brightness falls toward the bottom, saturation grows to the right. */
const AREA_SHADES =
  "linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)";

const HUE_SWEEP = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
  .map((hue) => `hsl(${String(hue)} 100% 50%)`)
  .join(", ")})`;

/** Where the area's thumb sits, which the stylesheet reads to place it. */
interface AreaThumbVariables {
  readonly "--bt-color-picker-x": MotionValue<number>;
  readonly "--bt-color-picker-y": MotionValue<number>;
}

/** Where the hue thumb sits. */
interface HueThumbVariables {
  readonly "--bt-color-picker-hue": MotionValue<number>;
}

type Axis = "s" | "v";
type Track = "area" | "hue";

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hueColor(hue: number): string {
  return `hsl(${String(hue)} 100% 50%)`;
}

function hexOf(hsv: Hsv): string {
  return formatHex(hsvToRgb(hsv));
}

/** The HSV of a hex color, keeping `hue` when the color is a gray, which has none of its own. */
function hsvOf(hex: string, hue: number): Hsv {
  const hsv = rgbToHsv(parseHex(hex));
  return hsv.s === 0 ? { ...hsv, h: hue } : hsv;
}

function percent(amount: number): string {
  return `${String(Math.round(amount * 100))}%`;
}

/**
 * Picks any color: an area for saturation (across) and brightness (up), a hue track, a hex code field and
 * optional presets. Dragging a thumb moves it with the pointer in the same frame; keys, codes and presets
 * glide it on `spring.smooth`. Arrow keys step 1% (1° of hue), Shift ten times as far, Page Up and Page
 * Down ten steps, Home and End to the ends. `ColorDot` opens one in a popover.
 *
 * @example
 * <ColorPicker label="Background hue" value={color} onValueChange={setColor} />
 */
export function ColorPicker({
  label,
  value,
  defaultValue = "#000000",
  onValueChange,
  onValueCommit,
  presets,
  disabled = false,
  labels,
  className,
  ...rest
}: ColorPickerProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const [color, setColor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const safe = isHex(color) ? formatHex(parseHex(color)) : "#000000";
  const [held, setHeld] = useState<{ readonly hex: string; readonly hsv: Hsv }>(
    () => ({ hex: safe, hsv: hsvOf(safe, 0) }),
  );
  const hsv = held.hex === safe ? held.hsv : hsvOf(safe, held.hsv.h);
  const [dragging, setDragging] = useState<Track | null>(null);
  const [axis, setAxis] = useState<Axis>("s");
  const [draft, setDraft] = useState<string | null>(null);
  const reduced = useMotionPreference() === "reduced";
  const tracked = use(AnimationTrackingContext);
  const saturation = useMotionValue(hsv.s);
  const brightness = useMotionValue(hsv.v);
  const hue = useMotionValue(hsv.h);
  const base = useTransform(hue, hueColor);
  const fill = useTransform(() =>
    hexOf({ h: hue.get(), s: saturation.get(), v: brightness.get() }),
  );
  const sInput = useRef<HTMLInputElement>(null);
  const vInput = useRef<HTMLInputElement>(null);
  const drag = useRef<Track | null>(null);
  const latest = useRef(hsv);
  const hintId = useId();

  useEffect(() => {
    if (
      dragging !== null ||
      (saturation.get() === hsv.s &&
        brightness.get() === hsv.v &&
        hue.get() === hsv.h)
    ) {
      return undefined;
    }
    if (reduced) {
      saturation.jump(hsv.s);
      brightness.jump(hsv.v);
      hue.jump(hsv.h);
      return undefined;
    }
    const release = tracked ? trackAnimation() : undefined;
    const glides = [
      animate(saturation, hsv.s, spring.smooth),
      animate(brightness, hsv.v, spring.smooth),
      animate(hue, hsv.h, spring.smooth),
    ];
    void Promise.all(glides).then(() => release?.());
    return () => {
      for (const glide of glides) glide.stop();
      release?.();
    };
  }, [
    hsv.s,
    hsv.v,
    hsv.h,
    dragging,
    reduced,
    tracked,
    saturation,
    brightness,
    hue,
  ]);

  const change = (next: Hsv, commit: boolean): void => {
    const hex = hexOf(next);
    latest.current = next;
    setHeld({ hex, hsv: next });
    setColor(hex);
    if (commit) onValueCommit?.(hex);
  };

  const fromPointer = (
    track: Track,
    event: PointerEvent<HTMLDivElement>,
  ): Hsv => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (track === "hue") {
      const thumb =
        event.currentTarget
          .querySelector('[data-bt-part="hue-thumb"]')
          ?.getBoundingClientRect().width ?? 0;
      const along =
        (event.clientX - rect.left - thumb / 2) / (rect.width - thumb);
      return { ...latest.current, h: clampUnit(along) * 360 };
    }
    return {
      ...latest.current,
      s: clampUnit((event.clientX - rect.left) / rect.width),
      v: clampUnit(1 - (event.clientY - rect.top) / rect.height),
    };
  };
  const follow = (next: Hsv): void => {
    saturation.jump(next.s);
    brightness.jump(next.v);
    hue.jump(next.h);
    change(next, false);
  };

  const startDrag = (
    track: Track,
    event: PointerEvent<HTMLDivElement>,
  ): void => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = track;
    latest.current = hsv;
    setDragging(track);
    follow(fromPointer(track, event));
    const input =
      track === "area"
        ? sInput.current
        : event.currentTarget.querySelector<HTMLInputElement>("input");
    input?.focus({ preventScroll: true });
  };
  const moveDrag = (
    track: Track,
    event: PointerEvent<HTMLDivElement>,
  ): void => {
    if (drag.current !== track) return;
    follow(fromPointer(track, event));
  };
  const endDrag = (): void => {
    if (drag.current === null) return;
    drag.current = null;
    setDragging(null);
    onValueCommit?.(hexOf(latest.current));
  };

  const step = (event: KeyboardEvent): number => (event.shiftKey ? 0.1 : 0.01);

  const areaKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) return;
    const amount = step(event);
    const next = ((): { readonly hsv: Hsv; readonly axis: Axis } | null => {
      switch (event.key) {
        case "ArrowRight":
          return { hsv: { ...hsv, s: clampUnit(hsv.s + amount) }, axis: "s" };
        case "ArrowLeft":
          return { hsv: { ...hsv, s: clampUnit(hsv.s - amount) }, axis: "s" };
        case "ArrowUp":
          return { hsv: { ...hsv, v: clampUnit(hsv.v + amount) }, axis: "v" };
        case "ArrowDown":
          return { hsv: { ...hsv, v: clampUnit(hsv.v - amount) }, axis: "v" };
        case "PageUp":
          return { hsv: { ...hsv, [axis]: clampUnit(hsv[axis] + 0.1) }, axis };
        case "PageDown":
          return { hsv: { ...hsv, [axis]: clampUnit(hsv[axis] - 0.1) }, axis };
        case "Home":
          return { hsv: { ...hsv, [axis]: 0 }, axis };
        case "End":
          return { hsv: { ...hsv, [axis]: 1 }, axis };
        default:
          return null;
      }
    })();
    if (!next) return;
    event.preventDefault();
    if (next.hsv.s !== hsv.s || next.hsv.v !== hsv.v) change(next.hsv, true);
    (next.axis === "s" ? sInput : vInput).current?.focus({
      preventScroll: true,
    });
  };

  const hueKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) return;
    const amount = event.shiftKey ? 10 : 1;
    const next = ((): number | null => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          return hsv.h + amount;
        case "ArrowLeft":
        case "ArrowDown":
          return hsv.h - amount;
        case "PageUp":
          return hsv.h + 10;
        case "PageDown":
          return hsv.h - 10;
        case "Home":
          return 0;
        case "End":
          return 360;
        default:
          return null;
      }
    })();
    if (next === null) return;
    event.preventDefault();
    const h = Math.min(360, Math.max(0, next));
    if (h !== hsv.h) change({ ...hsv, h }, true);
  };

  const takeDraft = (): void => {
    if (draft === null) return;
    setDraft(null);
    if (!isHex(draft)) return;
    const hex = formatHex(parseHex(draft));
    if (hex !== safe) change(hsvOf(hex, hsv.h), true);
  };

  const swatches: readonly Swatch[] | undefined = presets?.map((preset) => ({
    value: formatHex(parseHex(preset)),
    label: preset,
    fill: preset,
  }));

  const areaThumb: MotionStyle & AreaThumbVariables = {
    "--bt-color-picker-x": saturation,
    "--bt-color-picker-y": brightness,
    backgroundColor: fill,
  };
  const hueThumb: MotionStyle & HueThumbVariables = {
    "--bt-color-picker-hue": hue,
    backgroundColor: base,
  };

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      className={cx("bt-color-picker", className)}
      data-bt="ColorPicker"
      data-dragging={dragging ?? undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <motion.div
        data-bt-part="area"
        style={{ backgroundColor: base, backgroundImage: AREA_SHADES }}
        onPointerDown={(event) => {
          startDrag("area", event);
        }}
        onPointerMove={(event) => {
          moveDrag("area", event);
        }}
        onPointerUp={endDrag}
        onLostPointerCapture={endDrag}
      >
        <motion.span
          data-bt-part="area-thumb"
          data-bt-allow-overlap=""
          style={areaThumb}
          aria-hidden="true"
        />
        <VisuallyHidden.Root asChild>
          <input
            ref={sInput}
            type="range"
            tabIndex={axis === "s" ? 0 : -1}
            min={0}
            max={100}
            value={Math.round(hsv.s * 100)}
            disabled={disabled}
            aria-label={words.saturation}
            aria-describedby={hintId}
            aria-valuetext={percent(hsv.s)}
            onKeyDown={areaKeyDown}
            onFocus={() => {
              setAxis("s");
            }}
            onChange={(event) => {
              change({ ...hsv, s: Number(event.target.value) / 100 }, true);
            }}
          />
        </VisuallyHidden.Root>
        <VisuallyHidden.Root asChild>
          <input
            ref={vInput}
            type="range"
            tabIndex={axis === "v" ? 0 : -1}
            min={0}
            max={100}
            value={Math.round(hsv.v * 100)}
            disabled={disabled}
            aria-label={words.brightness}
            aria-describedby={hintId}
            aria-valuetext={percent(hsv.v)}
            onKeyDown={areaKeyDown}
            onFocus={() => {
              setAxis("v");
            }}
            onChange={(event) => {
              change({ ...hsv, v: Number(event.target.value) / 100 }, true);
            }}
          />
        </VisuallyHidden.Root>
        <VisuallyHidden.Root id={hintId}>{words.hint}</VisuallyHidden.Root>
      </motion.div>
      <div
        data-bt-part="hue"
        onPointerDown={(event) => {
          startDrag("hue", event);
        }}
        onPointerMove={(event) => {
          moveDrag("hue", event);
        }}
        onPointerUp={endDrag}
        onLostPointerCapture={endDrag}
      >
        <span
          data-bt-part="track"
          style={{ backgroundImage: HUE_SWEEP }}
          aria-hidden="true"
        />
        <motion.span
          data-bt-part="hue-thumb"
          style={hueThumb}
          aria-hidden="true"
        />
        <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
        <VisuallyHidden.Root asChild>
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(hsv.h)}
            disabled={disabled}
            aria-label={words.hue}
            aria-valuetext={`${String(Math.round(hsv.h))}°`}
            onKeyDown={hueKeyDown}
            onChange={(event) => {
              change({ ...hsv, h: Number(event.target.value) }, true);
            }}
          />
        </VisuallyHidden.Root>
      </div>
      <div data-bt-part="code">
        <motion.span
          data-bt-part="swatch"
          style={{ backgroundColor: fill }}
          aria-hidden="true"
        />
        <label data-bt-part="field" data-bt-control="">
          <span data-bt-part="hash" aria-hidden="true">
            #
          </span>
          <input
            value={draft ?? safe.slice(1).toUpperCase()}
            disabled={disabled}
            aria-label={words.code}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={7}
            data-bt-draft={draft === null ? undefined : ""}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onBlur={takeDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                takeDraft();
              } else if (event.key === "Escape" && draft !== null) {
                setDraft(null);
              }
            }}
          />
        </label>
      </div>
      {swatches ? (
        <SwatchGrid
          label={words.presets}
          swatches={swatches}
          columns={6}
          value={safe}
          disabled={disabled}
          onValueChange={(preset) => {
            change(hsvOf(preset, hsv.h), true);
          }}
        />
      ) : null}
    </div>
  );
}
