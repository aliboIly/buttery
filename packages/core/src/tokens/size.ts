/** Control heights: comfortable or compact. */
export type Density = "comfortable" | "compact";

/** A height token's comfortable and compact values and what it's for. */
export interface HeightDefinition {
  /** Height in px at comfortable density. */
  readonly comfortable: number;
  /** Height in px at compact density. */
  readonly compact: number;
  /** What the height is for. */
  readonly description: string;
}

/** Control heights by density, emitted as `--bt-h-<name>`. */
export const heights = {
  badge: {
    comfortable: 20,
    compact: 18,
    description: "Value badge, chip, keycap.",
  },
  sm: {
    comfortable: 28,
    compact: 28,
    description:
      "Small icon buttons, dialog close. Stays 28 in compact: standalone buttons are never shorter.",
  },
  control: {
    comfortable: 34,
    compact: 30,
    description: "Segmented track (items are 4 shorter), inputs, selects.",
  },
  button: {
    comfortable: 36,
    compact: 32,
    description:
      "Pill buttons, split button, header actions, menu items, toast.",
  },
  cta: {
    comfortable: 48,
    compact: 40,
    description: "Dialog step buttons, floating toolbar.",
  },
  row: {
    comfortable: 50,
    compact: 42,
    description: "Inspector row, including its 1px divider.",
  },
  "row-split": {
    comfortable: 64,
    compact: 56,
    description:
      "Inspector split row: two half-rows side by side, tall enough for a tilt pad or an anchor grid, including its 1px divider.",
  },
  header: {
    comfortable: 56,
    compact: 48,
    description: "App header bar.",
  },
  "sub-nav": {
    comfortable: 48,
    compact: 48,
    description:
      "Page sub nav bar under the nav bar. Page chrome, so it keeps its height in compact.",
  },
} as const;

/** The name of a height token. */
export type HeightToken = keyof typeof heights;

/** A width token's variable, value and what it's for. */
export interface WidthDefinition {
  /** The CSS variable that holds the width. */
  readonly cssVar: `--bt-${string}`;
  /** Width in px. */
  readonly value: number;
  /** What the width is for. */
  readonly description: string;
}

/** Named widths and layout sizes. */
export const widths = {
  "shell-max": {
    cssVar: "--bt-w-shell-max",
    value: 1380,
    description: "AppShell max width, centered.",
  },
  inspector: {
    cssVar: "--bt-w-inspector",
    value: 340,
    description: "Inspector panel width.",
  },
  dialog: { cssVar: "--bt-w-dialog", value: 400, description: "Dialog width." },
  "dialog-md": {
    cssVar: "--bt-w-dialog-md",
    value: 560,
    description: "A wider dialog, such as a list of choices.",
  },
  "dialog-lg": {
    cssVar: "--bt-w-dialog-lg",
    value: 880,
    description:
      "A two-column dialog, such as an announcement with copy beside an illustration.",
  },
  "menu-min": {
    cssVar: "--bt-w-menu-min",
    value: 200,
    description: "Minimum menu width.",
  },
  "row-control": {
    cssVar: "--bt-w-row-control",
    value: 160,
    description: "Slider width in an inspector row.",
  },
  page: {
    cssVar: "--bt-w-page",
    value: 1200,
    description: "Page content max width.",
  },
  "bento-row": {
    cssVar: "--bt-bento-row",
    value: 320,
    description: "Bento grid row unit.",
  },
  "inset-titlebar": {
    cssVar: "--bt-inset-titlebar",
    value: 84,
    description:
      "HeaderBar's left padding under the macOS window controls, from its own left edge.",
  },
  "focus-width": {
    cssVar: "--bt-focus-width",
    value: 2,
    description: "Focus ring thickness.",
  },
  "focus-offset": {
    cssVar: "--bt-focus-offset",
    value: 2,
    description: "Gap between an element and its focus ring.",
  },
  "icon-sm": {
    cssVar: "--bt-icon-sm",
    value: 16,
    description: "Icons inside controls.",
  },
  "icon-md": {
    cssVar: "--bt-icon-md",
    value: 20,
    description: "Icons in empty states.",
  },
  "blur-scrim": {
    cssVar: "--bt-blur-scrim",
    value: 10,
    description: "Backdrop blur behind menus that open over content.",
  },
} as const;

/** Icon stroke width, emitted as `--bt-icon-stroke`. */
export const iconStroke = 1.75;
