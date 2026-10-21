/**
 * Durations in milliseconds, emitted as `--bt-dur-<name>`. `reduced` is the longest fade with reduced motion;
 * `shimmer` is one pass of a skeleton's looping shimmer.
 */
export const durations = {
  instant: 0,
  press: 80,
  reduced: 100,
  fast: 120,
  base: 200,
  slow: 300,
  shimmer: 1600,
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
 * Motion transitions by name (MOTION_SPEC §2): `instant` for reduced motion and snaps the user isn't
 * driving (a value the user drags is set directly, with `MotionValue.jump()` or a style, since even
 * `instant` lands a frame later), `snappy` for selection indicators, `smooth` (the default) for discrete
 * changes, `morph` for big surfaces changing shape and `gentle` for choreographed entrances.
 * `visualDuration` is in seconds; with `bounce: 0` a spring never overshoots. `instant` lands on the next
 * frame; it lasts 1ms rather than 0 because WebKit can drop the last frame of a zero-length layout
 * animation (DECISIONS, Phase 3).
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

/** The scale a hero visual's pieces grow from as they assemble, rising into place. */
export const assembleScale = 0.96;

/**
 * Timing tokens that aren't durations of a single transition, in milliseconds: the gap between staggered
 * items, hover intent (a menu opens once the pointer has rested on its trigger, at once when it moves between
 * the triggers of an open menu or comes back soon after one closed, and closes after a grace), the tooltip delay, one `Loop` step, the longest
 * choreographed entrance, a confetti burst's life, how long a toast stays (longer with an action, so
 * there's time to reach it), how long a live region holds what it announced before it's cleared, so
 * reading the page later doesn't hear it again, how long letters typed in a list build up one search
 * before it starts over, how long chrome that follows a change waits before it arrives, as crop mode's
 * handles and toolbar do, how long a stat takes to count up to its number, how long the pointer rests on a
 * menu item before its submenu opens, and how long loading has to last before a loading pill shows.
 */
export const timing = {
  stagger: 50,
  "delay-hover-open": 150,
  "delay-hover-close": 100,
  "delay-hover-skip": 300,
  "delay-tooltip": 500,
  "loop-cycle": 4000,
  "entrance-max": 900,
  celebration: 900,
  "toast-life": 3000,
  "toast-life-action": 5000,
  "announcement-life": 1000,
  typeahead: 500,
  "delay-follow": 80,
  "count-up": 800,
  "delay-submenu": 40,
  "delay-loading": 300,
} as const;

/** Scale applied while a pressable element is held down. */
export const pressScale = 0.97;
