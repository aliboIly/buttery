/** Durations in milliseconds, emitted as `--bt-dur-<name>`. Springs for Motion arrive with the motion system. */
export const durations = {
  instant: 0,
  press: 80,
  fast: 120,
  base: 200,
  slow: 300,
} as const;

export type DurationToken = keyof typeof durations;

/** Easing curves for CSS transitions, emitted as `--bt-ease-<name>`. */
export const easings = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  standard: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export type EasingToken = keyof typeof easings;

/** Timing tokens that aren't durations of a single transition. */
export const timing = {
  stagger: 50,
  "delay-hover-open": 80,
  "delay-hover-close": 150,
  "delay-tooltip": 500,
} as const;

/** Scale applied while a pressable element is held down. */
export const pressScale = 0.97;
