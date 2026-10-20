/** Durations in milliseconds, emitted as `--bt-dur-<name>`. */
export const durations = {
  instant: 0,
  press: 80,
  fast: 120,
  base: 200,
  slow: 300,
} as const;

/** The name of a duration token. */
export type DurationToken = keyof typeof durations;

/** Cubic-bezier control points for each easing: Motion takes them as they are, CSS as `cubic-bezier()`. */
export const easingCurves = {
  out: [0.22, 1, 0.36, 1],
  in: [0.4, 0, 1, 1],
  standard: [0.2, 0, 0, 1],
} as const;

/** The name of an easing token. */
export type EasingToken = keyof typeof easingCurves;

function cubicBezier(curve: readonly number[]): string {
  return `cubic-bezier(${curve.join(", ")})`;
}

/** Easing curves for CSS transitions, emitted as `--bt-ease-<name>`. */
export const easings: Readonly<Record<EasingToken, string>> = {
  out: cubicBezier(easingCurves.out),
  in: cubicBezier(easingCurves.in),
  standard: cubicBezier(easingCurves.standard),
};

/**
 * Motion transitions by name (MOTION_SPEC §2): `instant` for direct manipulation and reduced motion,
 * `snappy` for selection indicators, `smooth` (the default) for discrete changes, `morph` for big surfaces
 * changing shape and `gentle` for choreographed entrances. `visualDuration` is in seconds; with
 * `bounce: 0` a spring never overshoots. `instant` lands on the next frame; it lasts 1ms rather than 0
 * because WebKit can drop the last frame of a zero-length layout animation (DECISIONS, Phase 3).
 */
export const spring = {
  instant: { type: "tween", duration: 0.001 },
  snappy: { type: "spring", visualDuration: 0.18, bounce: 0 },
  smooth: { type: "spring", visualDuration: 0.25, bounce: 0 },
  morph: { type: "spring", visualDuration: 0.38, bounce: 0 },
  gentle: { type: "spring", visualDuration: 0.45, bounce: 0.08 },
} as const;

/** The name of a spring token. */
export type SpringToken = keyof typeof spring;

/** How far things travel as they arrive, in px: a toast or a popover rises 8, a revealed section 16. */
export const travel = {
  rise: 8,
  reveal: 16,
} as const;

/** The scale menus and dialogs grow from as they arrive. Leaving, they fade without shrinking. */
export const enterScale = 0.97;

/** Timing tokens that aren't durations of a single transition, in milliseconds. */
export const timing = {
  stagger: 50,
  "delay-hover-open": 80,
  "delay-hover-close": 150,
  "delay-tooltip": 500,
  "loop-cycle": 4000,
} as const;

/** Scale applied while a pressable element is held down. */
export const pressScale = 0.97;
