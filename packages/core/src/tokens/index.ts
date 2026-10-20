export { colors, contrastPairs } from "./color.ts";
export type { ColorDefinition, ColorToken, ContrastPair } from "./color.ts";
export {
  durations,
  easingCurves,
  easings,
  enterScale,
  pressScale,
  spring,
  timing,
  travel,
} from "./motion.ts";
export type { DurationToken, EasingToken, SpringToken } from "./motion.ts";
export { radii } from "./radius.ts";
export type { RadiusToken } from "./radius.ts";
export { shadows } from "./shadow.ts";
export type { ShadowDefinition, ShadowToken } from "./shadow.ts";
export { heights, iconStroke, widths } from "./size.ts";
export type {
  Density,
  HeightDefinition,
  HeightToken,
  WidthDefinition,
} from "./size.ts";
export { space, spaceStep, spaceVar, spaceWell } from "./space.ts";
export type { SpaceStep, SpaceValue } from "./space.ts";
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
export { layerBands, zIndex } from "./z.ts";
export type { LayerBand, ZToken } from "./z.ts";

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

/** A surface level: app, panel, section, card, raised, floating, dialog or inset. */
export type SurfaceLevel = (typeof surfaceLevels)[number];

/** Resolved color scheme. `ButteryProvider` also accepts `"system"`. */
export type ColorScheme = "light" | "dark";
