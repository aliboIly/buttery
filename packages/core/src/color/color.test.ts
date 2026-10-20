import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  formatHex,
  formatOklch,
  hexToOklch,
  mixOklab,
  oklchToHex,
  oklchToRgb,
  parseHex,
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
