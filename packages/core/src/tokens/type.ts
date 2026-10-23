import type { ColorToken } from "./color.ts";

/** Font stacks, emitted as `--bt-font-<name>`. Inter ships with `@butteryui/core`; "Inter Fallback" is metric-matched Arial. */
export const fontFamilies = {
  sans: '"Inter Variable", "Inter Fallback", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
} as const;

/** Letter-spacing, emitted as `--bt-tracking-<name>`. Applied by size: tight at 15px+ semibold, display at 32px+. */
export const tracking = {
  normal: "0em",
  tight: "-0.01em",
  display: "-0.02em",
} as const;

/** The name of a letter-spacing token. */
export type TrackingToken = keyof typeof tracking;

/** A text role's size, line height, weight and color. */
export interface TextRoleDefinition {
  /** Font size in px. */
  readonly size: number;
  /** Line height in px. */
  readonly lineHeight: number;
  /** Font weight. */
  readonly weight: 400 | 500 | 600;
  /** Text color, when the role sets one. */
  readonly color?: ColorToken;
  /** Uses tabular figures. */
  readonly tabular?: boolean;
  /** Trims the line box to the cap height and baseline. */
  readonly trim?: boolean;
  /** What the role is for. */
  readonly description: string;
}

/**
 * App text roles. `trim` marks roles that stack in text blocks; their line boxes are trimmed to cap height and
 * baseline where the engine supports `text-box`, so spacing tokens between them equal the visible gaps.
 */
export const textRoles = {
  "title-lg": {
    size: 24,
    lineHeight: 30,
    weight: 600,
    color: "text-strong",
    trim: true,
    description: "App page titles and metric values.",
  },
  "title-md": {
    size: 18,
    lineHeight: 24,
    weight: 600,
    color: "text-strong",
    trim: true,
    description: "Section headings in app pages, card titles in a right rail.",
  },
  title: {
    size: 15,
    lineHeight: 20,
    weight: 600,
    color: "text",
    trim: true,
    description: "Empty-state title.",
  },
  "dialog-title": {
    size: 15,
    lineHeight: 20,
    weight: 600,
    color: "text-strong",
    trim: true,
    description: "Dialog title.",
  },
  "title-sm": {
    size: 14,
    lineHeight: 20,
    weight: 600,
    color: "text",
    description: "App or document title in the header.",
  },
  label: {
    size: 14,
    lineHeight: 20,
    weight: 500,
    color: "text",
    description: "Inspector row labels.",
  },
  body: {
    size: 14,
    lineHeight: 22,
    weight: 400,
    color: "text-secondary",
    trim: true,
    description: "Dialog body.",
  },
  "body-sm": {
    size: 13,
    lineHeight: 20,
    weight: 400,
    color: "text-secondary",
    trim: true,
    description: "Empty-state description.",
  },
  button: {
    size: 14,
    lineHeight: 20,
    weight: 500,
    description: "Pill buttons. Takes its color from the button.",
  },
  "button-lg": {
    size: 15,
    lineHeight: 20,
    weight: 600,
    description: "48px CTA buttons. Takes its color from the button.",
  },
  control: {
    size: 13,
    lineHeight: 18,
    weight: 500,
    color: "text-secondary",
    description: "Segmented items, section titles, reset links.",
  },
  menu: {
    size: 14,
    lineHeight: 20,
    weight: 400,
    color: "text",
    description: "Menu items.",
  },
  badge: {
    size: 12,
    lineHeight: 16,
    weight: 500,
    color: "text-secondary",
    tabular: true,
    description: "Value badges and chips.",
  },
  caption: {
    size: 12,
    lineHeight: 16,
    weight: 400,
    color: "text-tertiary",
    trim: true,
    description: "Hints under a title.",
  },
  kbd: {
    size: 11,
    lineHeight: 14,
    weight: 500,
    color: "text-secondary",
    description: "Keycaps.",
  },
} as const;

/** The name of a text role in the app type scale. */
export type TextRole = keyof typeof textRoles;

/** A display size step: small, medium or large. */
export type DisplayStep = "sm" | "md" | "lg";

/** A page display role's size and line height at each step, weight and color. */
export interface DisplayRoleDefinition {
  /** Font size and line height in px at each display step. */
  readonly steps: Readonly<
    Record<DisplayStep, readonly [size: number, lineHeight: number]>
  >;
  /** Font weight. */
  readonly weight: 400 | 600;
  /** Text color. */
  readonly color: ColorToken;
  /** What the role is for. */
  readonly description: string;
}

/** Page display roles. Steps follow the container width: sm below 640, md to 1023, lg from 1024. */
export const displayRoles = {
  display: {
    steps: { sm: [32, 38], md: [40, 44], lg: [48, 52] },
    weight: 600,
    color: "text-strong",
    description: "Hero headlines.",
  },
  "heading-1": {
    steps: { sm: [24, 30], md: [28, 34], lg: [32, 38] },
    weight: 600,
    color: "text-strong",
    description: "Section headings on pages.",
  },
  "heading-2": {
    steps: { sm: [20, 26], md: [22, 28], lg: [24, 30] },
    weight: 600,
    color: "text-strong",
    description: "Sub-section and card headings on pages.",
  },
  "body-lg": {
    steps: { sm: [16, 24], md: [17, 26], lg: [18, 28] },
    weight: 400,
    color: "text-secondary",
    description: "Lead paragraphs on pages.",
  },
} as const;

/** The name of a page display role. */
export type DisplayRole = keyof typeof displayRoles;

/** Container widths where display roles step up. */
export const displayBreakpoints = { md: 640, lg: 1024 } as const;

/** The tracking a role gets at a given size and weight. */
export function trackingFor(size: number, weight: number): TrackingToken {
  if (size >= 32) return "display";
  if (size >= 15 && weight >= 600) return "tight";
  return "normal";
}
