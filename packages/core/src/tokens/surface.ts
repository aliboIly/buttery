import type { ColorToken } from "./color.ts";
import type { RadiusToken } from "./radius.ts";
import type { ShadowToken } from "./shadow.ts";
import type { SpaceStep } from "./space.ts";

export interface SurfaceDefinition {
  readonly background: ColorToken;
  readonly radius: RadiusToken | "none";
  readonly shadow?: ShadowToken;
  readonly border?: ColorToken;
  /** Padding as spacing steps, in CSS shorthand order. `well` is the section inset (`spaceWell`). */
  readonly padding?: readonly (SpaceStep | "well")[];
  readonly description: string;
}

/** Surface levels for the `.bt-surface[data-level]` recipe and the `Surface` primitive. */
export const surfaces = {
  app: {
    background: "bg-app",
    radius: "none",
    description: "The page or stage behind everything.",
  },
  panel: {
    background: "bg-surface",
    radius: "3xl",
    shadow: "shadow-card",
    padding: ["2"],
    description: "Header bar, inspector panel.",
  },
  section: {
    background: "bg-section",
    radius: "2xl",
    border: "border",
    padding: ["0", "well", "well"],
    description:
      "A well holding a card. Its radius is the card's plus the well, so the card sits concentric inside it.",
  },
  card: {
    background: "bg-surface",
    radius: "lg",
    shadow: "shadow-card",
    description: "Rows and content inside a section.",
  },
  raised: {
    background: "bg-raised",
    radius: "lg",
    shadow: "shadow-raised",
    description: "Active segment, secondary button, hovered card.",
  },
  floating: {
    background: "bg-floating",
    radius: "3xl",
    shadow: "shadow-floating",
    padding: ["1.5"],
    description: "Menus, popovers, floating toolbars.",
  },
  dialog: {
    background: "bg-surface",
    radius: "dialog",
    shadow: "shadow-dialog",
    padding: ["2"],
    description: "Dialogs.",
  },
  inset: {
    background: "bg-inset",
    radius: "md",
    border: "border-strong",
    description: "Small recessed controls.",
  },
} as const;
