export interface ColorDefinition {
  readonly light: string;
  readonly dark: string;
  readonly description: string;
}

/** Color tokens, emitted as `--bt-<name>`. Dark values are derived: the references are light only. */
export const colors = {
  "bg-app": {
    light: "#f3f3f4",
    dark: "#0f0f10",
    description: "Page and stage background behind everything.",
  },
  "bg-surface": {
    light: "#ffffff",
    dark: "#19191b",
    description: "Header bar, inspector panel, inner cards, dialogs.",
  },
  "bg-raised": {
    light: "#ffffff",
    dark: "#2c2c30",
    description:
      "Elements raised above a surface or a control track: the active segment, secondary buttons.",
  },
  "bg-floating": {
    light: "#ffffff",
    dark: "#1f1f22",
    description: "Floating layers: menus, popovers, floating toolbars.",
  },
  "bg-section": {
    light: "#f7f7f7",
    dark: "#141416",
    description: "The well behind a section's card.",
  },
  "bg-inset": {
    light: "#fefefe",
    dark: "#161618",
    description: "Small recessed controls: tilt pad, anchor grid.",
  },
  "bg-control": {
    light: "#f1f1f1",
    dark: "#232326",
    description: "Segmented track, value badge, soft button, hover fill.",
  },
  "bg-control-subtle": {
    light: "#f9f9f9",
    dark: "#1e1e20",
    description: "Disabled soft button and chip.",
  },
  "bg-item-hover": {
    light: "#f7f7f7",
    dark: "#202023",
    description: "Highlighted menu item.",
  },
  "bg-control-active": {
    light: "#ececec",
    dark: "#2a2a2d",
    description: "Ghost trigger while its menu is open.",
  },
  border: {
    light: "#ebebeb",
    dark: "#2a2a2e",
    description: "Row dividers, section borders, separators.",
  },
  "border-strong": {
    light: "#e3e3e3",
    dark: "#333338",
    description: "Slider track, inputs, anchor grid, tilt pad.",
  },
  "text-strong": {
    light: "#1a1a1a",
    dark: "#f5f5f6",
    description: "Dialog titles and page headings.",
  },
  text: {
    light: "#303030",
    dark: "#ececed",
    description: "Labels, primary text, the active segment.",
  },
  "text-secondary": {
    light: "#616161",
    dark: "#a0a0a6",
    description:
      "Section titles, body copy, value badges, icons, inactive segments.",
  },
  "text-tertiary": {
    light: "#6b6b6b",
    dark: "#8e8e95",
    description: "Captions and hints.",
  },
  "text-disabled": {
    light: "#acacac",
    dark: "#55555b",
    description:
      "Disabled text. Exempt from contrast rules, like all inactive UI.",
  },
  "text-disabled-subtle": {
    light: "#b8b8b8",
    dark: "#4d4d53",
    description: "Disabled chip text, one step quieter than text-disabled.",
  },
  "icon-disabled": {
    light: "#c0c0c0",
    dark: "#4a4a50",
    description: "Disabled icons.",
  },
  primary: {
    light: "#1a1a1a",
    dark: "#f2f2f3",
    description: "Primary button and split button.",
  },
  "primary-hover": {
    light: "#2b2b2b",
    dark: "#ffffff",
    description: "Primary hover. Lightens in light mode rather than darkening.",
  },
  "primary-disabled": {
    light: "#a3a3a3",
    dark: "#4a4a50",
    description: "Disabled primary background; the text keeps on-primary.",
  },
  "on-primary": {
    light: "#ffffff",
    dark: "#111111",
    description: "Text on primary.",
  },
  "inverse-bg": {
    light: "#1a1a1a",
    dark: "#f2f2f3",
    description: "Tooltip and toast background.",
  },
  "inverse-text": {
    light: "#ffffff",
    dark: "#111111",
    description: "Tooltip and toast text.",
  },
  "inverse-text-secondary": {
    light: "#a3a3a3",
    dark: "#6b6b6b",
    description: "Secondary text and actions in tooltips and toasts.",
  },
  accent: {
    light: "#2862e0",
    dark: "#4f89ff",
    description: "Focus ring, tilt arc, selection highlights.",
  },
  selection: {
    light: "rgba(40, 98, 224, 0.2)",
    dark: "rgba(79, 137, 255, 0.3)",
    description: "Text selection highlight.",
  },
  overlay: {
    light: "rgba(0, 0, 0, 0.32)",
    dark: "rgba(0, 0, 0, 0.55)",
    description: "Dialog scrim, with no blur.",
  },
  wash: {
    light: "rgba(255, 255, 255, 0.55)",
    dark: "rgba(15, 15, 16, 0.55)",
    description: "Wash over the blurred page behind a menu.",
  },
  dot: {
    light: "#e8e8e8",
    dark: "#2e2e32",
    description: "Page dots and idle anchor dots.",
  },
  "dot-active": {
    light: "#303030",
    dark: "#ececed",
    description: "The active page dot.",
  },
  "ring-selected": {
    light: "#cacaca",
    dark: "#4a4a50",
    description: "Selected swatch ring, crop handle border, drop-zone dashes.",
  },
  "knob-top": {
    light: "#535353",
    dark: "#535353",
    description: "Top of the slider thumb's vertical gradient.",
  },
  "knob-bottom": {
    light: "#2e2e2e",
    dark: "#2e2e2e",
    description: "Bottom of the slider thumb's vertical gradient.",
  },
  "knob-center": {
    light: "#474747",
    dark: "#474747",
    description:
      "Center of the radial knob gradient (tilt knob, active anchor dot).",
  },
  "knob-edge": {
    light: "#353535",
    dark: "#353535",
    description: "Edge of the radial knob gradient.",
  },
  "knob-border": {
    light: "#1c1c1c",
    dark: "#000000",
    description: "Knob border.",
  },
  "knob-highlight": {
    light: "#7a7a7a",
    dark: "#7a7a7a",
    description: "One-pixel inset highlight along the top of a knob.",
  },
  "knob-grip": {
    light: "#b2b2b2",
    dark: "#b2b2b2",
    description: "The two grip lines on the slider thumb.",
  },
  "traffic-red": {
    light: "#ed6c61",
    dark: "#ed6c61",
    description: "Window-chrome dot in illustrations.",
  },
  "traffic-yellow": {
    light: "#f5c05c",
    dark: "#f5c05c",
    description: "Window-chrome dot in illustrations.",
  },
  "traffic-green": {
    light: "#5ac55e",
    dark: "#5ac55e",
    description: "Window-chrome dot in illustrations.",
  },
  "brand-butter": {
    light: "#f5d06f",
    dark: "#f5d06f",
    description:
      "buttery's brand color. Decorative only: the mark, docs, marketing.",
  },
  "brand-butter-deep": {
    light: "#e8b64a",
    dark: "#e8b64a",
    description: "The brand mark's side and shadow.",
  },
  "brand-cream": {
    light: "#fff4d6",
    dark: "#fff4d6",
    description: "The brand mark's top face.",
  },
  skeleton: {
    light: "#f2f2f4",
    dark: "#232326",
    description: "Skeleton blocks in illustrations.",
  },
  "skeleton-strong": {
    light: "#ececee",
    dark: "#2a2a2d",
    description: "Skeleton lines in illustrations.",
  },
} as const;

export type ColorToken = keyof typeof colors;

export interface ContrastPair {
  readonly text: ColorToken;
  readonly on: ColorToken;
  readonly minimum: 3 | 4.5;
}

const textOn = (
  text: ColorToken,
  backgrounds: readonly ColorToken[],
): ContrastPair[] => backgrounds.map((on) => ({ text, on, minimum: 4.5 }));

/** Every active text/background pair the components use. Each must pass in both themes. */
export const contrastPairs: readonly ContrastPair[] = [
  ...textOn("text-strong", ["bg-surface", "bg-floating", "bg-app"]),
  ...textOn("text", [
    "bg-surface",
    "bg-raised",
    "bg-floating",
    "bg-section",
    "bg-app",
    "bg-control",
    "bg-item-hover",
  ]),
  ...textOn("text-secondary", [
    "bg-surface",
    "bg-raised",
    "bg-floating",
    "bg-section",
    "bg-app",
    "bg-control",
    "bg-control-active",
  ]),
  ...textOn("text-tertiary", ["bg-surface", "bg-section", "bg-app"]),
  { text: "on-primary", on: "primary", minimum: 4.5 },
  { text: "on-primary", on: "primary-hover", minimum: 4.5 },
  { text: "inverse-text", on: "inverse-bg", minimum: 4.5 },
  { text: "inverse-text-secondary", on: "inverse-bg", minimum: 4.5 },
  { text: "accent", on: "bg-surface", minimum: 3 },
  { text: "accent", on: "bg-app", minimum: 3 },
  { text: "dot-active", on: "bg-surface", minimum: 3 },
];
