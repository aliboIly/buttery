export interface ShadowDefinition {
  /** The light theme value. */
  readonly light: string;
  /** The dark theme value. */
  readonly dark: string;
  /** What the shadow is for. */
  readonly description: string;
}

/** Elevation tokens, emitted as `--bt-shadow-<name>` and `--bt-ring-<name>`. */
export const shadows = {
  "shadow-card": {
    light: "0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    dark: "0 0 0 1px rgba(255, 255, 255, 0.06), 0 1px 2px rgba(0, 0, 0, 0.24)",
    description:
      "Header bar, inspector panel, inner card. The 1px ring is the card's edge.",
  },
  "shadow-raised": {
    light: "0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)",
    dark: "0 0 0 1px rgba(255, 255, 255, 0.09), 0 1px 3px rgba(0, 0, 0, 0.6)",
    description: "Active segment, secondary button, hovered card.",
  },
  "shadow-knob": {
    light:
      "0 1px 2px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
    dark: "0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
    description: "Slider thumb and tilt knob.",
  },
  "shadow-floating": {
    light:
      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)",
    dark: "0 0 0 1px rgba(255, 255, 255, 0.09), 0 8px 24px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3)",
    description: "Menus, floating toolbar, toast.",
  },
  "shadow-dialog": {
    light: "0 0 0 1px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.16)",
    dark: "0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 48px rgba(0, 0, 0, 0.6)",
    description: "Dialogs.",
  },
  "shadow-inset": {
    light: "inset 0 0 0 1px rgba(0, 0, 0, 0.06)",
    dark: "inset 0 0 0 1px rgba(255, 255, 255, 0.06)",
    description: "Swatches and color dots.",
  },
  "ring-select": {
    light:
      "0 0 0 2px var(--bt-bg-surface), 0 0 0 3.5px var(--bt-ring-selected)",
    dark: "0 0 0 2px var(--bt-bg-surface), 0 0 0 3.5px var(--bt-ring-selected)",
    description: "Selected swatch.",
  },
  "ring-focus": {
    light: "0 0 0 2px var(--bt-bg-surface), 0 0 0 4px var(--bt-accent)",
    dark: "0 0 0 2px var(--bt-bg-surface), 0 0 0 4px var(--bt-accent)",
    description:
      "Focus ring as a shadow, for components that can't use the outline ring.",
  },
} as const;

export type ShadowToken = keyof typeof shadows;
