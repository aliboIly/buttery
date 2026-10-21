import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  formatHex,
  formatOklch,
  hexToOklch,
  hsvToRgb,
  isHex,
  mixOklab,
  oklchToHex,
  oklchToRgb,
  parseHex,
  rgbToHsv,
} from "./color.ts";

describe("hex parsing", () => {
  it("reads short and long hex and writes lowercase long hex", () => {
    expect(formatHex(parseHex("#FA0"))).toBe("#ffaa00");
    expect(formatHex(parseHex("2862e0"))).toBe("#2862e0");
  });

  it("rejects anything that isn't hex, with a fix in the message", () => {
    expect(() => parseHex("rgb(0 0 0)")).toThrow(/#rgb or #rrggbb/);
  });
});

describe("OKLCH", () => {
  it("round-trips sRGB colors", () => {
    for (const hex of [
      "#000000",
      "#ffffff",
      "#2862e0",
      "#f3f3f4",
      "#e8b64a",
      "#19191b",
    ]) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });

  it("matches known OKLCH values", () => {
    const white = hexToOklch("#ffffff");
    expect(white.l).toBeCloseTo(1, 3);
    expect(white.c).toBeCloseTo(0, 3);
    expect(formatOklch(hexToOklch("#2862e0"))).toBe("oklch(0.536 0.202 262.9)");
  });

  it("maps out-of-gamut colors into sRGB by lowering chroma", () => {
    const { r, g, b } = oklchToRgb({ l: 0.7, c: 0.4, h: 145 });
    for (const channel of [r, g, b]) {
      expect(channel).toBeGreaterThanOrEqual(-1e-4);
      expect(channel).toBeLessThanOrEqual(1 + 1e-4);
    }
  });

  it("mixes in OKLab without passing through gray", () => {
    const blue = hexToOklch("#2862e0");
    const yellow = hexToOklch("#f5d06f");
    const middle = mixOklab(blue, yellow, 0.5);
    expect(middle.l).toBeCloseTo((blue.l + yellow.l) / 2, 5);
    expect(mixOklab(blue, yellow, 0)).toEqual(blue);
  });
});

describe("contrast", () => {
  it("follows WCAG 2", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#6b6b6b", "#ffffff")).toBeCloseTo(5.33, 2);
  });
});

describe("hsv", () => {
  it("round-trips hex through HSV", () => {
    for (const hex of [
      "#2862e0",
      "#c7d2fe",
      "#f5d06f",
      "#177245",
      "#ff0000",
      "#000000",
      "#ffffff",
    ]) {
      expect(formatHex(hsvToRgb(rgbToHsv(parseHex(hex))))).toBe(hex);
    }
  });

  it("reads the primaries and grays", () => {
    expect(rgbToHsv(parseHex("#ff0000"))).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv(parseHex("#00ff00"))).toEqual({ h: 120, s: 1, v: 1 });
    expect(rgbToHsv(parseHex("#0000ff"))).toEqual({ h: 240, s: 1, v: 1 });
    expect(rgbToHsv(parseHex("#ff00ff")).h).toBe(300);
    expect(rgbToHsv(parseHex("#808080"))).toEqual({ h: 0, s: 0, v: 128 / 255 });
    expect(formatHex(hsvToRgb({ h: 210, s: 0, v: 1 }))).toBe("#ffffff");
    expect(formatHex(hsvToRgb({ h: 60, s: 1, v: 1 }))).toBe("#ffff00");
  });

  it("tells hex colors from other text", () => {
    expect(isHex("#2862e0")).toBe(true);
    expect(isHex("2862E0")).toBe(true);
    expect(isHex(" #fff ")).toBe(true);
    expect(isHex("#ffff")).toBe(false);
    expect(isHex("blue")).toBe(false);
  });
});
