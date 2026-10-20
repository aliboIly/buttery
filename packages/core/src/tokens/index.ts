export { colors, contrastPairs } from "./color.ts";
export type { ColorDefinition, ColorToken, ContrastPair } from "./color.ts";
export { durations, easings, pressScale, timing } from "./motion.ts";
export type { DurationToken, EasingToken } from "./motion.ts";
export { radii } from "./radius.ts";
export type { RadiusToken } from "./radius.ts";
export { shadows } from "./shadow.ts";
export type { ShadowDefinition, ShadowToken } from "./shadow.ts";
export { heights, widths } from "./size.ts";
export type {
  Density,
  HeightDefinition,
  HeightToken,
  WidthDefinition,
} from "./size.ts";
export { space, spaceVar, spaceWell } from "./space.ts";
export type { SpaceStep } from "./space.ts";
export {
  displayBreakpoints,
  displayRoles,
  fontFamilies,
  textRoles,
  tracking,
  trackingFor,
} from "./type.ts";
export type {
  DisplayRole,
  DisplayRoleDefinition,
  DisplayStep,
  TextRole,
  TextRoleDefinition,
  TrackingToken,
} from "./type.ts";
export { zIndex } from "./z.ts";
export type { ZToken } from "./z.ts";

export { surfaces } from "./surface.ts";
export type { SurfaceDefinition } from "./surface.ts";

/** The surface levels the `.bt-surface` recipe and `Surface` primitive understand. */
export const surfaceLevels = [
  "app",
  "panel",
  "section",
  "card",
  "raised",
  "floating",
  "dialog",
  "inset",
] as const;

export type SurfaceLevel = (typeof surfaceLevels)[number];

/** Resolved color scheme. `ButteryProvider` also accepts `"system"`. */
export type ColorScheme = "light" | "dark";
