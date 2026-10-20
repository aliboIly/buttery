/** An sRGB color with channels from 0 to 1. */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** An OKLCH color: lightness 0–1, chroma from 0 (about 0.37 at most in sRGB), hue in degrees. */
export interface Oklch {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toLinear(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number): number {
  return channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/** Parses `#rgb` or `#rrggbb`. Throws on anything else. */
export function parseHex(hex: string): Rgb {
  const match = HEX.exec(hex.trim());
  const digits = match?.[1];
  if (digits === undefined) {
    throw new Error(`"${hex}" isn't a hex color. Use #rgb or #rrggbb.`);
  }
  const full = digits.length === 3 ? digits.replace(/./g, "$&$&") : digits;
  const channel = (index: number): number =>
    Number.parseInt(full.slice(index, index + 2), 16) / 255;
  return { r: channel(0), g: channel(2), b: channel(4) };
}

/** Formats an sRGB color as lowercase `#rrggbb`, clamping out-of-range channels. */
export function formatHex({ r, g, b }: Rgb): string {
  const channel = (value: number): string =>
    Math.round(clamp(value, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Converts sRGB to OKLCH. */
export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bb);
  const hue = chroma < 1e-6 ? 0 : (Math.atan2(bb, a) * 180) / Math.PI;
  return { l: lightness, c: chroma, h: (hue + 360) % 360 };
}

function oklchToUnclampedRgb({ l, c, h }: Oklch): Rgb {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  };
}

function inGamut({ r, g, b }: Rgb): boolean {
  const epsilon = 1e-4;
  return [r, g, b].every(
    (channel) => channel >= -epsilon && channel <= 1 + epsilon,
  );
}

/** Converts OKLCH to sRGB, lowering chroma until the color fits the sRGB gamut. */
export function oklchToRgb(color: Oklch): Rgb {
  const target = { ...color, l: clamp(color.l, 0, 1), c: Math.max(0, color.c) };
  if (inGamut(oklchToUnclampedRgb(target))) return oklchToUnclampedRgb(target);
  let low = 0;
  let high = target.c;
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (inGamut(oklchToUnclampedRgb({ ...target, c: middle }))) low = middle;
    else high = middle;
  }
  return oklchToUnclampedRgb({ ...target, c: low });
}

/** Converts a hex color to OKLCH. */
export function hexToOklch(hex: string): Oklch {
  return rgbToOklch(parseHex(hex));
}

/** Converts OKLCH to a gamut-mapped hex color. */
export function oklchToHex(color: Oklch): string {
  return formatHex(oklchToRgb(color));
}

/** Formats OKLCH for CSS, rounded for readability. */
export function formatOklch({ l, c, h }: Oklch): string {
  const round = (value: number, digits: number): number =>
    Number(value.toFixed(digits));
  return `oklch(${String(round(l, 3))} ${String(round(c, 3))} ${String(round(h, 1))})`;
}

/** WCAG 2 relative luminance of a hex color. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2 contrast ratio between two hex colors, from 1 to 21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Mixes two OKLCH colors in OKLab, which keeps midpoints from going gray. `amount` 0 returns `from`, 1 returns `to`. */
export function mixOklab(from: Oklch, to: Oklch, amount: number): Oklch {
  const toLab = ({ l, c, h }: Oklch): readonly [number, number, number] => {
    const radians = (h * Math.PI) / 180;
    return [l, c * Math.cos(radians), c * Math.sin(radians)];
  };
  const [l1, a1, b1] = toLab(from);
  const [l2, a2, b2] = toLab(to);
  const a = a1 + (a2 - a1) * amount;
  const b = b1 + (b2 - b1) * amount;
  const chroma = Math.hypot(a, b);
  const hue = chroma < 1e-6 ? 0 : (Math.atan2(b, a) * 180) / Math.PI;
  return { l: l1 + (l2 - l1) * amount, c: chroma, h: (hue + 360) % 360 };
}
