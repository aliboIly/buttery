/** The concentric radius scale, emitted as `--bt-r-<name>`. A child's radius is its parent's minus the parent's padding. */
export const radii = {
  xs: 6,
  kbd: 5,
  thumb: 7,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  "2xl": 16,
  "3xl": 16,
  dialog: 18,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radii;
