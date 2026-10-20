import { describe, expect, it } from "vitest";
import { contrastRatio, hexToOklch } from "../color/color.ts";
import { colors, contrastPairs } from "../tokens/index.ts";
import { createTheme } from "./create-theme.ts";

describe("createTheme", () => {
  it("returns nothing to apply for the defaults", () => {
    expect(createTheme()).toEqual({
      light: {},
      dark: {},
      shared: {},
      density: "comfortable",
    });
  });

  it("derives a dark accent that holds AA on the dark surface", () => {
    const theme = createTheme({ accent: "#7C3AED" });
    expect(theme.light["--bt-accent"]).toBe("#7c3aed");
    const dark = theme.dark["--bt-accent"];
    expect(dark).toBeDefined();
    expect(
      contrastRatio(dark ?? "", colors["bg-surface"].dark),
    ).toBeGreaterThanOrEqual(4.5);
    expect(theme.light["--bt-selection"]).toBe("rgba(124, 58, 237, 0.2)");
  });

  it("keeps primary text readable in both themes", () => {
    for (const primary of ["#1a1a1a", "#2862e0", "#f5d06f", "#0f766e"]) {
      const theme = createTheme({ primary });
      for (const scheme of ["light", "dark"] as const) {
        const background = theme[scheme]["--bt-primary"] ?? "";
        const text = theme[scheme]["--bt-on-primary"] ?? "";
        expect(
          contrastRatio(text, background),
          `${primary} in ${scheme}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("inverts a neutral primary in dark and keeps a colored one colored", () => {
    expect(
      hexToOklch(createTheme({ primary: "#1a1a1a" }).dark["--bt-primary"] ?? "")
        .l,
    ).toBeGreaterThan(0.9);
    const blue = hexToOklch(
      createTheme({ primary: "#2862e0" }).dark["--bt-primary"] ?? "",
    );
    expect(blue.c).toBeGreaterThan(0.1);
    expect(blue.h).toBeCloseTo(hexToOklch("#2862e0").h, 0);
  });

  it("tints every gray toward the chosen neutral", () => {
    const warm = createTheme({ neutral: "warm" });
    const app = hexToOklch(warm.light["--bt-bg-app"] ?? "");
    expect(app.h).toBeGreaterThan(55);
    expect(app.h).toBeLessThan(95);
    expect(app.c).toBeGreaterThan(0.002);
    expect(
      hexToOklch(createTheme({ neutral: "cool" }).dark["--bt-bg-surface"] ?? "")
        .h,
    ).toBeGreaterThan(220);
  });

  it("scales radii and keeps concentric pairs concentric", () => {
    const soft = createTheme({ radius: "soft" }).shared;
    const px = (name: string): number =>
      Number.parseInt(soft[`--bt-r-${name}`] ?? "", 10);
    expect(px("lg")).toBe(15);
    expect(px("2xl")).toBe(px("lg") + 4);
    expect(px("md")).toBe(px("dialog") - 8);
    expect(px("lg")).toBeGreaterThan(
      Number.parseInt(
        createTheme({ radius: "crisp" }).shared["--bt-r-lg"] ?? "",
        10,
      ),
    );
  });

  it("keeps every declared contrast pair under custom accents and neutrals", () => {
    const themes = [
      createTheme({ accent: "#7c3aed" }),
      createTheme({ accent: "#0f766e", neutral: "warm" }),
      createTheme({ accent: "#c2410c", neutral: "cool" }),
      createTheme({ neutral: "warm" }),
      createTheme({ accent: "#3b82f6" }),
      createTheme({ accent: "#6366f1", neutral: "cool" }),
    ];
    for (const [index, theme] of themes.entries()) {
      for (const scheme of ["light", "dark"] as const) {
        const value = (token: keyof typeof colors): string =>
          theme[scheme][`--bt-${token}`] ?? colors[token][scheme];
        for (const pair of contrastPairs) {
          expect(
            contrastRatio(value(pair.text), value(pair.on)),
            `theme ${String(index)}, ${scheme}: ${pair.text} on ${pair.on}`,
          ).toBeGreaterThanOrEqual(pair.minimum);
        }
      }
    }
  });

  it("derives the info tint from a custom accent, and keeps it when the accent is too light for text", () => {
    const theme = createTheme({ accent: "#7c3aed" });
    const tint = hexToOklch(theme.light["--bt-accent-subtle"] ?? "");
    expect(tint.h).toBeCloseTo(hexToOklch("#7c3aed").h, -1);
    expect(tint.l).toBeGreaterThan(0.9);
    expect(theme.dark["--bt-accent-subtle"]).toBeDefined();
    expect(theme.light["--bt-accent-text"]).toBe("#7c3aed");
    const light = createTheme({ accent: "#3b82f6" }).light;
    expect(light["--bt-accent-subtle"]).not.toBe(colors["bg-surface"].light);
    expect(light["--bt-accent-text"]).not.toBe("#3b82f6");
    expect(
      contrastRatio(
        light["--bt-accent-text"] ?? "",
        light["--bt-accent-subtle"] ?? "",
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("lets overrides win", () => {
    const theme = createTheme({
      accent: "#7c3aed",
      overrides: { dark: { accent: "#a78bfa" } },
    });
    expect(theme.dark["--bt-accent"]).toBe("#a78bfa");
  });
});
