import { describe, expect, it } from "vitest";
import { gradientCss, gradients, solids } from "./index.ts";

describe("palettes", () => {
  it("has 20 gradients and 14 solids with unique ids", () => {
    expect(gradients).toHaveLength(20);
    expect(solids).toHaveLength(14);
    expect(new Set(gradients.map((preset) => preset.id)).size).toBe(20);
  });

  it("runs every gradient from lighter top-left to darker bottom-right", () => {
    for (const preset of gradients) {
      expect(preset.from.l, preset.id).toBeGreaterThan(preset.to.l);
    }
  });

  it("stores gamut-mapped hex for every stop and solid", () => {
    const hex = /^#[0-9a-f]{6}$/;
    for (const preset of gradients) {
      expect(preset.fromHex).toMatch(hex);
      expect(preset.toHex).toMatch(hex);
    }
    for (const solid of solids) expect(solid.hex).toMatch(hex);
  });

  it("blends in OKLab at 135° by default", () => {
    const [first] = gradients;
    expect(first && gradientCss(first)).toMatch(
      /^linear-gradient\(135deg in oklab, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/,
    );
  });
});
