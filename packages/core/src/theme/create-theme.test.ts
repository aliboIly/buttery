import { describe, expect, it } from "vitest";
import { contrastRatio, hexToOklch } from "../color/color.ts";
import { colors } from "../tokens/index.ts";
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

  it("lets overrides win", () => {
    const theme = createTheme({
      accent: "#7c3aed",
      overrides: { dark: { accent: "#a78bfa" } },
    });
    expect(theme.dark["--bt-accent"]).toBe("#a78bfa");
  });
});
