import {
  contrastRatio,
  hexToOklch,
  mixOklab,
  oklchToHex,
  parseHex,
  formatHex,
  relativeLuminance,
} from "../color/color.ts";
import type { Oklch } from "../color/color.ts";
import { colors, radii, spaceWell } from "../tokens/index.ts";
import type {
  ColorScheme,
  ColorToken,
  Density,
  RadiusToken,
} from "../tokens/index.ts";

/** Tint applied to every gray. */
export type Neutral = "gray" | "warm" | "cool";

/** Corner scale. Concentric pairs (section = card + well) stay concentric at every scale. */
export type RadiusScale = "soft" | "default" | "crisp";

/** A map of buttery custom properties to values. */
export type CssVariables = Readonly<Record<`--bt-${string}`, string>>;

/** What `createTheme` can change: neutrals, accent, radii, fonts, density and individual colors. */
export interface ThemeOptions {
  /** Focus ring and selection color, as hex. Defaults to buttery's blue. */
  readonly accent?: string;
  /** Primary button color, as hex. Defaults to near-black, inverted in dark. */
  readonly primary?: string;
  /** Tint for the grays. Defaults to `"gray"`. */
  readonly neutral?: Neutral;
  /** Corner scale. Defaults to `"default"`. */
  readonly radius?: RadiusScale;
  /** Density the provider starts in. Defaults to `"comfortable"`. */
  readonly density?: Density;
  /** The final word on any color token, per theme. */
  readonly overrides?: {
    readonly light?: Partial<Record<ColorToken, string>>;
    readonly dark?: Partial<Record<ColorToken, string>>;
  };
}

/** The output of `createTheme`: only the variables that differ from buttery's defaults. */
export interface ButteryTheme {
  /** Variables that apply in the light theme. */
  readonly light: CssVariables;
  /** Variables that apply in the dark theme. */
  readonly dark: CssVariables;
  /** Variables that apply in both themes, such as radii and fonts. */
  readonly shared: CssVariables;
  /** The density the theme asks for. */
  readonly density: Density;
}

type ColorValues = Partial<Record<ColorToken, string>>;

const NEUTRAL_TOKENS: readonly ColorToken[] = [
  "bg-app",
  "bg-surface",
  "bg-raised",
  "bg-floating",
  "bg-section",
  "bg-inset",
  "bg-control",
  "bg-control-subtle",
  "bg-item-hover",
  "bg-control-active",
  "border",
  "border-strong",
  "control-border",
  "text-strong",
  "text",
  "text-secondary",
  "text-tertiary",
  "text-disabled",
  "text-disabled-subtle",
  "icon-disabled",
  "primary",
  "primary-hover",
  "primary-disabled",
  "inverse-bg",
  "inverse-text-secondary",
  "dot",
  "dot-active",
  "ring-selected",
  "skeleton",
  "skeleton-strong",
];

const NEUTRAL_HUE: Readonly<Record<Exclude<Neutral, "gray">, number>> = {
  warm: 75,
  cool: 255,
};

const RADIUS_FACTOR: Readonly<Record<RadiusScale, number>> = {
  soft: 1.25,
  default: 1,
  crisp: 0.6,
};

const DARK_TEXT = "#111111";
const LIGHT_TEXT = "#ffffff";

function normalizeHex(hex: string): string {
  return formatHex(parseHex(hex));
}

function withLightness(color: Oklch, l: number): string {
  return oklchToHex({ ...color, l: Math.min(1, Math.max(0, l)) });
}

function readableOn(background: string): string {
  return contrastRatio(LIGHT_TEXT, background) >=
    contrastRatio(DARK_TEXT, background)
    ? LIGHT_TEXT
    : DARK_TEXT;
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${String(Math.round(r * 255))}, ${String(Math.round(g * 255))}, ${String(Math.round(b * 255))}, ${String(alpha)})`;
}

/** Tints a gray toward `hue`, keeping its luminance so every contrast ratio stays where the default had it. */
function tint(hex: string, hue: number): string {
  const { l } = hexToOklch(hex);
  const chroma = 0.003 + 0.009 * (1 - Math.abs(2 * l - 1));
  const target = relativeLuminance(hex);
  let low = Math.max(0, l - 0.05);
  let high = Math.min(1, l + 0.05);
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (
      relativeLuminance(oklchToHex({ l: middle, c: chroma, h: hue })) < target
    ) {
      low = middle;
    } else {
      high = middle;
    }
  }
  const candidates = [low, high].map((lightness) =>
    oklchToHex({ l: lightness, c: chroma, h: hue }),
  );
  return candidates.reduce((best, candidate) =>
    Math.abs(relativeLuminance(candidate) - target) <
    Math.abs(relativeLuminance(best) - target)
      ? candidate
      : best,
  );
}

function neutralColors(neutral: Neutral, scheme: ColorScheme): ColorValues {
  if (neutral === "gray") return {};
  const hue = NEUTRAL_HUE[neutral];
  return Object.fromEntries(
    NEUTRAL_TOKENS.map((token) => [token, tint(colors[token][scheme], hue)]),
  );
}

/**
 * The accent's tint for info callouts: a tenth of the accent over the light surface, and a dark surface
 * a step lighter with a little of the accent's hue. It fades toward the surface until the accent and
 * secondary text both hold 4.5:1 on it.
 */
function accentTint(
  accent: string,
  surface: string,
  secondaryText: string,
  scheme: ColorScheme,
): string {
  const base = hexToOklch(accent);
  const ground = hexToOklch(surface);
  const full =
    scheme === "light"
      ? mixOklab(ground, base, 0.1)
      : { l: ground.l + 0.03, c: Math.min(base.c * 0.25, 0.05), h: base.h };
  for (let strength = 1; strength > 0; strength -= 0.1) {
    const tinted = oklchToHex(mixOklab(ground, full, strength));
    if (
      contrastRatio(accent, tinted) >= 4.5 &&
      contrastRatio(secondaryText, tinted) >= 4.5
    ) {
      return tinted;
    }
  }
  return surface;
}

function accentColors(
  accent: string,
  surfaces: Readonly<Record<ColorScheme, string>>,
  secondaryText: Readonly<Record<ColorScheme, string>>,
): { light: ColorValues; dark: ColorValues } {
  const light = normalizeHex(accent);
  const base = hexToOklch(light);
  let lightness = Math.max(base.l, 0.65);
  let dark = withLightness(base, lightness);
  while (contrastRatio(dark, surfaces.dark) < 4.5 && lightness < 0.9) {
    lightness += 0.02;
    dark = withLightness(base, lightness);
  }
  return {
    light: {
      accent: light,
      "accent-subtle": accentTint(
        light,
        surfaces.light,
        secondaryText.light,
        "light",
      ),
      selection: rgba(light, 0.2),
    },
    dark: {
      accent: dark,
      "accent-subtle": accentTint(
        dark,
        surfaces.dark,
        secondaryText.dark,
        "dark",
      ),
      selection: rgba(dark, 0.3),
    },
  };
}

function primaryColors(primary: string): {
  light: ColorValues;
  dark: ColorValues;
} {
  const light = normalizeHex(primary);
  const base = hexToOklch(light);
  const neutralPrimary = base.c < 0.03;
  const lightHover = withLightness(
    base,
    base.l < 0.6 ? base.l + 0.06 : base.l - 0.05,
  );
  const darkBase = neutralPrimary
    ? 0.96
    : Math.min(0.78, Math.max(0.6, base.l + 0.08));
  const dark = withLightness(base, darkBase);
  const darkHover = withLightness(base, neutralPrimary ? 1 : darkBase + 0.05);
  const muted = { ...base, c: base.c * 0.25 };
  return {
    light: {
      primary: light,
      "primary-hover": lightHover,
      "primary-disabled": withLightness(muted, 0.72),
      "on-primary": readableOn(light),
    },
    dark: {
      primary: dark,
      "primary-hover": darkHover,
      "primary-disabled": withLightness(muted, 0.42),
      "on-primary": readableOn(dark),
    },
  };
}

function radiusVariables(scale: RadiusScale): CssVariables {
  if (scale === "default") return {};
  const factor = RADIUS_FACTOR[scale];
  const scaled = (token: RadiusToken): number =>
    Math.max(2, Math.round(radii[token] * factor));
  const lg = scaled("lg");
  const dialog = scaled("dialog");
  const values: Readonly<Record<Exclude<RadiusToken, "full">, number>> = {
    xs: scaled("xs"),
    kbd: scaled("kbd"),
    thumb: scaled("thumb"),
    sm: scaled("sm"),
    md: Math.max(2, dialog - 8),
    lg,
    xl: lg + 2,
    "2xl": lg + spaceWell,
    "3xl": scaled("3xl"),
    dialog,
  };
  return Object.fromEntries(
    Object.entries(values).map(([token, px]) => [
      `--bt-r-${token}`,
      `${String(px)}px`,
    ]),
  );
}

function toVariables(values: ColorValues): CssVariables {
  return Object.fromEntries(
    Object.entries(values).map(([token, value]) => [`--bt-${token}`, value]),
  );
}

/**
 * Builds a theme from a few choices. Only the variables that differ from buttery's defaults are returned;
 * `ButteryProvider` applies them on top of the stylesheet. Dark values are derived, and `overrides` win.
 */
export function createTheme(options: ThemeOptions = {}): ButteryTheme {
  const neutral = options.neutral ?? "gray";
  const light: ColorValues = { ...neutralColors(neutral, "light") };
  const dark: ColorValues = { ...neutralColors(neutral, "dark") };

  if (options.primary !== undefined) {
    const primary = primaryColors(options.primary);
    Object.assign(light, primary.light);
    Object.assign(dark, primary.dark);
  }
  if (options.accent !== undefined) {
    const accent = accentColors(
      options.accent,
      {
        light: light["bg-surface"] ?? colors["bg-surface"].light,
        dark: dark["bg-surface"] ?? colors["bg-surface"].dark,
      },
      {
        light: light["text-secondary"] ?? colors["text-secondary"].light,
        dark: dark["text-secondary"] ?? colors["text-secondary"].dark,
      },
    );
    Object.assign(light, accent.light);
    Object.assign(dark, accent.dark);
  }
  Object.assign(light, options.overrides?.light);
  Object.assign(dark, options.overrides?.dark);

  return {
    light: toVariables(light),
    dark: toVariables(dark),
    shared: radiusVariables(options.radius ?? "default"),
    density: options.density ?? "comfortable",
  };
}
