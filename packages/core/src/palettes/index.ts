import { mixOklab, oklchToHex } from "../color/color.ts";
import type { Oklch } from "../color/color.ts";

/** A two-stop gradient preset. `from` sits top-left and `to` bottom-right. */
export interface GradientPreset {
  readonly id: string;
  readonly name: string;
  readonly from: Oklch;
  readonly to: Oklch;
  /** `from` as a gamut-mapped hex color. */
  readonly fromHex: string;
  /** `to` as a gamut-mapped hex color. */
  readonly toHex: string;
}

/** A solid color preset. */
export interface SolidPreset {
  readonly id: string;
  readonly name: string;
  readonly color: Oklch;
  /** `color` as a gamut-mapped hex color. */
  readonly hex: string;
}

type Stop = readonly [l: number, c: number, h: number];

function oklch([l, c, h]: Stop): Oklch {
  return { l, c, h };
}

function gradient(
  id: string,
  name: string,
  from: Stop,
  to: Stop,
): GradientPreset {
  return {
    id,
    name,
    from: oklch(from),
    to: oklch(to),
    fromHex: oklchToHex(oklch(from)),
    toHex: oklchToHex(oklch(to)),
  };
}

/**
 * buttery's 20 gradient presets: a cream row, a fresh row and a deep row over the same six hue families
 * (butter, apricot, rose, lilac, sky, mint), then a light neutral pair (paper, stone). Each stop shifts
 * lightness, chroma and hue a little toward its neighbor, so the blends stay soft.
 */
export const gradients: readonly GradientPreset[] = [
  gradient("cream", "Cream", [0.965, 0.035, 95], [0.9, 0.075, 75]),
  gradient("peach", "Peach", [0.94, 0.04, 62], [0.86, 0.085, 38]),
  gradient("blush", "Blush", [0.94, 0.035, 15], [0.86, 0.075, 352]),
  gradient("lilac", "Lilac", [0.93, 0.04, 315], [0.85, 0.08, 288]),
  gradient("mist", "Mist", [0.94, 0.03, 235], [0.86, 0.065, 210]),
  gradient("mint", "Mint", [0.95, 0.035, 165], [0.88, 0.07, 140]),
  gradient("honey", "Honey", [0.86, 0.11, 88], [0.74, 0.15, 62]),
  gradient("apricot", "Apricot", [0.8, 0.12, 58], [0.66, 0.16, 32]),
  gradient("rose", "Rose", [0.78, 0.11, 10], [0.64, 0.16, 352]),
  gradient("violet", "Violet", [0.74, 0.12, 300], [0.56, 0.17, 280]),
  gradient("sky", "Sky", [0.8, 0.09, 235], [0.62, 0.14, 258]),
  gradient("sea", "Sea", [0.8, 0.09, 180], [0.6, 0.11, 200]),
  gradient("espresso", "Espresso", [0.46, 0.05, 55], [0.3, 0.035, 40]),
  gradient("slate", "Slate", [0.52, 0.025, 250], [0.34, 0.02, 255]),
  gradient("ink", "Ink", [0.4, 0.08, 275], [0.24, 0.06, 285]),
  gradient("forest", "Forest", [0.46, 0.06, 160], [0.3, 0.045, 175]),
  gradient("plum", "Plum", [0.42, 0.07, 340], [0.27, 0.05, 325]),
  gradient("graphite", "Graphite", [0.38, 0.006, 260], [0.22, 0.004, 260]),
  gradient("paper", "Paper", [0.975, 0.01, 85], [0.905, 0.022, 72]),
  gradient("stone", "Stone", [0.955, 0.006, 250], [0.85, 0.014, 245]),
];

const SOLID_SOURCES = [
  "cream",
  "peach",
  "blush",
  "lilac",
  "mist",
  "mint",
  "espresso",
  "slate",
  "ink",
  "forest",
  "plum",
  "graphite",
  "paper",
  "stone",
];

/** buttery's 14 solid presets: the OKLab midpoints of the cream, deep and neutral gradients. */
export const solids: readonly SolidPreset[] = gradients
  .filter((preset) => SOLID_SOURCES.includes(preset.id))
  .map((preset) => {
    const color = mixOklab(preset.from, preset.to, 0.5);
    return { id: preset.id, name: preset.name, color, hex: oklchToHex(color) };
  });

/** CSS for a gradient preset, blended in OKLab. Defaults to buttery's 135° direction. */
export function gradientCss(preset: GradientPreset, angle = 135): string {
  return `linear-gradient(${String(angle)}deg in oklab, ${preset.fromHex}, ${preset.toHex})`;
}
