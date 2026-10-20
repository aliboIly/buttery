/** Layer bands, emitted as `--bt-z-<name>`. Never use a raw z-index. */
export const zIndex = {
  base: 0,
  raised: 10,
  "scrim-nav": 15,
  sticky: 20,
  floating: 30,
  dropdown: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
  tooltip: 80,
  dev: 90,
} as const;

export type ZToken = keyof typeof zIndex;
