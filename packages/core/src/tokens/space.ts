/** The 4px spacing scale. Keys are steps (px ÷ 4); emitted as `--bt-space-<step>` with `.` written as `_`. */
export const space = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
  "24": 96,
  "32": 128,
} as const;

export type SpaceStep = keyof typeof space;

type NumericStep<Step> = Step extends `${infer N extends number}` ? N : never;

/** A spacing step as a prop: `4`, `"4"` or `"0.5"`. */
export type SpaceValue = SpaceStep | NumericStep<SpaceStep>;

/** The step key for a spacing prop, as used in `data-gap` and `--bt-space-*`. */
export function spaceStep(value: SpaceValue): SpaceStep {
  return String(value) as SpaceStep;
}

/** The inset between a section well and its card, on the three open sides. */
export const spaceWell = 4;

/** CSS custom property name for a spacing step. */
export function spaceVar(step: SpaceStep): `--bt-space-${string}` {
  return `--bt-space-${step.replace(".", "_")}`;
}
