import type { Density } from "@buttery/core";

/** A viewport size in CSS pixels. */
export interface ButteryViewport {
  readonly width: number;
  readonly height: number;
}

/** A color scheme `expectButtery` emulates. */
export type ButteryColorScheme = "light" | "dark";

/** The combinations `expectButtery` runs: every viewport in every theme and density. */
export interface ButteryMatrix {
  readonly viewports: readonly ButteryViewport[];
  readonly themes: readonly ButteryColorScheme[];
  readonly densities: readonly Density[];
}

/** The full matrix from LAYOUT_RULES §5, for `pnpm test:layout` and every phase stop. */
export const fullMatrix: ButteryMatrix = {
  viewports: [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 960, height: 640 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1728, height: 1117 },
  ],
  themes: ["light", "dark"],
  densities: ["comfortable", "compact"],
};

/** The quick matrix `pnpm check` runs: phone and laptop widths, both themes, comfortable density. */
export const quickMatrix: ButteryMatrix = {
  viewports: [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ],
  themes: ["light", "dark"],
  densities: ["comfortable"],
};
