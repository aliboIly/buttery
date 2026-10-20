export type Density = "comfortable" | "compact";

export interface HeightDefinition {
  readonly comfortable: number;
  readonly compact: number;
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
  header: {
    comfortable: 56,
    compact: 48,
    description: "App header bar.",
  },
} as const;

export type HeightToken = keyof typeof heights;

export interface WidthDefinition {
  readonly cssVar: `--bt-${string}`;
  readonly value: number;
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
  "menu-min": {
    cssVar: "--bt-w-menu-min",
    value: 200,
    description: "Minimum menu width.",
  },
  "row-control": {
    cssVar: "--bt-w-row-control",
    value: 164,
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
