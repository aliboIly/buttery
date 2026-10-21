/** A color token's light and dark values and what it's for. */
export interface ColorDefinition {
  /** The light theme value. */
  readonly light: string;
  /** The dark theme value. */
  readonly dark: string;
  /** What the color is for. */
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
    description:
      "Slider track, anchor grid, tilt pad, and the edge of a disabled input.",
  },
  "control-border": {
    light: "#858585",
    dark: "#75757c",
    description:
      "The edge that marks a control where nothing else does: a text input's box, a checkbox's box, a switch's track. 3:1 on every surface.",
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
    dark: "#93939a",
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
  "divider-on-primary": {
    light: "rgba(255, 255, 255, 0.18)",
    dark: "rgba(17, 17, 17, 0.18)",
    description: "The hairline between a split button's halves.",
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
  "inverse-success": {
    light: "#4cc38a",
    dark: "#177245",
    description:
      "Success on the inverse surface: a success toast's icon. Each theme takes the other theme's success, which reads on its inverse surface.",
  },
  "inverse-warning": {
    light: "#f2a33a",
    dark: "#9a4d00",
    description: "Warning on the inverse surface: a warning toast's icon.",
  },
  "inverse-danger": {
    light: "#ff7a6e",
    dark: "#c72a1c",
    description: "Danger on the inverse surface: a danger toast's icon.",
  },
  "inverse-success-bg": {
    light: "#26342c",
    dark: "#d5e0d9",
    description:
      "A success toast: the inverse surface mixed toward inverse-success in OKLab, 18% (14% in dark).",
  },
  "inverse-warning-bg": {
    light: "#3b3024",
    dark: "#e7dad3",
    description:
      "A warning toast: the inverse surface mixed toward inverse-warning, 18% (14% in dark).",
  },
  "inverse-danger-bg": {
    light: "#3e2b28",
    dark: "#f0d9d5",
    description:
      "A danger toast: the inverse surface mixed toward inverse-danger, 18% (14% in dark).",
  },
  accent: {
    light: "#2862e0",
    dark: "#4f89ff",
    description: "Focus ring, tilt arc, selection highlights.",
  },
  "accent-subtle": {
    light: "#e9f0fd",
    dark: "#16223b",
    description: "Background of an info callout.",
  },
  "accent-text": {
    light: "#2862e0",
    dark: "#4f89ff",
    description:
      "The accent as text: links and icons in an info callout. 4.5:1 on the surface and on accent-subtle, even when a theme's accent is lighter.",
  },
  "chart-1": {
    light: "#2862e0",
    dark: "#4f89ff",
    description: "A chart's first series: the accent.",
  },
  "chart-2": {
    light: "#008254",
    dark: "#1ea971",
    description:
      "A chart's second series: the mint family at the accent's OKLCH lightness, chroma 0.14 or the most sRGB allows.",
  },
  "chart-3": {
    light: "#a65400",
    dark: "#cf752d",
    description:
      "A chart's third series: the apricot family at the accent's OKLCH lightness, chroma 0.14 or the most sRGB allows.",
  },
  "chart-4": {
    light: "#7b57b2",
    dark: "#9d7ad7",
    description:
      "A chart's fourth series: the lilac family at the accent's OKLCH lightness, chroma 0.14.",
  },
  "chart-5": {
    light: "#ae445b",
    dark: "#d6677c",
    description:
      "A chart's fifth series: the rose family at the accent's OKLCH lightness, chroma 0.14.",
  },
  "chart-muted": {
    light: "#8b8b8b",
    dark: "#6e6e74",
    description:
      "A comparison series, such as the previous period: the lightest gray still 3:1 on every chart background.",
  },
  danger: {
    light: "#c72a1c",
    dark: "#ff7a6e",
    description: "Errors: a field's border and message, error icons.",
  },
  "danger-subtle": {
    light: "#fdeceb",
    dark: "#3a1916",
    description: "Background of an error callout.",
  },
  success: {
    light: "#177245",
    dark: "#4cc38a",
    description: "Success text and icons, a met requirement.",
  },
  "success-subtle": {
    light: "#e7f5ed",
    dark: "#132c20",
    description: "Background of a success callout.",
  },
  warning: {
    light: "#9a4d00",
    dark: "#f2a33a",
    description: "Warning text and icons.",
  },
  "warning-subtle": {
    light: "#fdf1e2",
    dark: "#33230f",
    description: "Background of a warning callout.",
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
    light: "#5c5c5c",
    dark: "#5c5c5c",
    description:
      "Lit point of the radial knob gradient (tilt knob, active anchor dot), 30% down from the top.",
  },
  "knob-edge": {
    light: "#262626",
    dark: "#262626",
    description:
      "Where the radial knob gradient ends: the bottom edge, the side farthest from the lit point.",
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
  "knob-ring": {
    light: "#ffffff",
    dark: "#ffffff",
    description:
      "The ring around a thumb drawn over picked colors (the color picker's), the same in both themes so it shows on any color.",
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

/** The name of a color token. */
export type ColorToken = keyof typeof colors;

/** A text color and the background it sits on, with the contrast it has to reach. */
export interface ContrastPair {
  /** The text color. */
  readonly text: ColorToken;
  /** The background it sits on. */
  readonly on: ColorToken;
  /** The contrast ratio it has to reach: 4.5 for text, 3 for large text and icons. */
  readonly minimum: 3 | 4.5;
}

const textOn = (
  text: ColorToken,
  backgrounds: readonly ColorToken[],
): ContrastPair[] => backgrounds.map((on) => ({ text, on, minimum: 4.5 }));

/** Every active text/background pair the components use. Each must pass in both themes. */
const TEXT_SURFACES: readonly ColorToken[] = [
  "bg-app",
  "bg-surface",
  "bg-section",
  "bg-raised",
  "bg-floating",
  "bg-inset",
  "bg-control",
  "bg-item-hover",
  "bg-control-active",
];

export const contrastPairs: readonly ContrastPair[] = [
  ...textOn("text-strong", TEXT_SURFACES),
  ...textOn("text", TEXT_SURFACES),
  ...textOn("text-secondary", TEXT_SURFACES),
  ...textOn("text-tertiary", TEXT_SURFACES),
  { text: "on-primary", on: "primary", minimum: 4.5 },
  { text: "on-primary", on: "primary-hover", minimum: 4.5 },
  { text: "inverse-text", on: "inverse-bg", minimum: 4.5 },
  { text: "inverse-text-secondary", on: "inverse-bg", minimum: 4.5 },
  ...textOn("inverse-text", [
    "inverse-success-bg",
    "inverse-warning-bg",
    "inverse-danger-bg",
  ]),
  { text: "inverse-success", on: "inverse-success-bg", minimum: 3 },
  { text: "inverse-warning", on: "inverse-warning-bg", minimum: 3 },
  { text: "inverse-danger", on: "inverse-danger-bg", minimum: 3 },
  { text: "inverse-success", on: "inverse-bg", minimum: 3 },
  { text: "inverse-warning", on: "inverse-bg", minimum: 3 },
  { text: "inverse-danger", on: "inverse-bg", minimum: 3 },
  ...textOn("danger", [...TEXT_SURFACES, "danger-subtle"]),
  ...textOn("success", [...TEXT_SURFACES, "success-subtle"]),
  ...textOn("warning", [...TEXT_SURFACES, "warning-subtle"]),
  ...textOn("text", [
    "accent-subtle",
    "danger-subtle",
    "success-subtle",
    "warning-subtle",
  ]),
  ...textOn("text-secondary", [
    "accent-subtle",
    "danger-subtle",
    "success-subtle",
    "warning-subtle",
  ]),
  { text: "accent-text", on: "accent-subtle", minimum: 4.5 },
  { text: "accent-text", on: "bg-surface", minimum: 4.5 },
  ...TEXT_SURFACES.map((on): ContrastPair => ({
    text: "control-border",
    on,
    minimum: 3,
  })),
  { text: "accent", on: "bg-surface", minimum: 3 },
  { text: "accent", on: "bg-app", minimum: 3 },
  ...(
    [
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
      "chart-muted",
    ] as const
  ).flatMap((series) =>
    (["bg-surface", "bg-section", "bg-app", "bg-floating"] as const).map(
      (on): ContrastPair => ({ text: series, on, minimum: 3 }),
    ),
  ),
  { text: "dot-active", on: "bg-surface", minimum: 3 },
];
