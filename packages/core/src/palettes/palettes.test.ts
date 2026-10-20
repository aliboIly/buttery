import { describe, expect, it } from "vitest";
import { mixOklab } from "../color/color.ts";
import type { Oklch } from "../color/color.ts";
import { gradientCss, gradientRows, gradients, solids } from "./index.ts";
import type { GradientPreset } from "./index.ts";

/** A gradient's OKLab midpoint, as the swatch reads at a glance. */
function middle(preset: GradientPreset): Oklch {
  return mixOklab(preset.from, preset.to, 0.5);
}

/** Distance in OKLab: 0.02 is about the smallest difference people notice side by side. */
function distance(a: Oklch, b: Oklch): number {
  const [aa, ab] = [
    a.c * Math.cos((a.h * Math.PI) / 180),
    a.c * Math.sin((a.h * Math.PI) / 180),
  ];
  const [ba, bb] = [
    b.c * Math.cos((b.h * Math.PI) / 180),
    b.c * Math.sin((b.h * Math.PI) / 180),
  ];
  return Math.hypot(a.l - b.l, aa - ba, ab - bb);
}

describe("palettes", () => {
  it("has 24 gradients in four rows of six and 18 solids, with unique ids", () => {
    expect(gradients).toHaveLength(24);
    const { cream, fresh, deep, neutral } = gradientRows;
    expect([cream, fresh, deep, neutral].map((row) => row.length)).toEqual([
      6, 6, 6, 6,
    ]);
    expect(solids).toHaveLength(18);
    expect(new Set(gradients.map((preset) => preset.id)).size).toBe(24);
  });

  it("runs every gradient from lighter top-left to darker bottom-right", () => {
    for (const preset of gradients) {
      expect(preset.from.l, preset.id).toBeGreaterThan(preset.to.l);
    }
  });

  it("spreads the neutral row from light to dark, each a clear step from the last", () => {
    const row = gradientRows.neutral;
    expect(row.map((preset) => preset.id)).toEqual([
      "paper",
      "fog",
      "stone",
      "sand",
      "slate",
      "graphite",
    ]);
    for (const [index, preset] of row.entries()) {
      const before = row[index - 1];
      if (!before) continue;
      expect(middle(preset).l, preset.id).toBeLessThan(middle(before).l);
      expect(
        distance(middle(preset), middle(before)),
        preset.id,
      ).toBeGreaterThan(0.08);
    }
  });

  it("keeps graphite distinct from every color in the deep row", () => {
    const graphite = gradientRows.neutral.at(-1);
    if (!graphite) throw new Error("No graphite.");
    for (const deep of gradientRows.deep) {
      expect(distance(middle(graphite), middle(deep)), deep.id).toBeGreaterThan(
        0.06,
      );
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
