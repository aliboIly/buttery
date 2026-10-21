import { describe, expect, expectTypeOf, it } from "vitest";
import { contrastRatio } from "../color/color.ts";
import {
  colors,
  contrastPairs,
  displayRoles,
  heights,
  radii,
  shadows,
  space,
  spaceWell,
  textRoles,
  widths,
} from "./index.ts";
import type {
  ColorDefinition,
  ColorScheme,
  DisplayRoleDefinition,
  HeightDefinition,
  ShadowDefinition,
  TextRoleDefinition,
  WidthDefinition,
} from "./index.ts";

const SCHEMES: readonly ColorScheme[] = ["light", "dark"];
const COLOR =
  /^(?:#[0-9a-f]{6}|rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (?:0|1|0?\.\d+)\))$/;

describe("token shapes", () => {
  it("match their definitions", () => {
    expectTypeOf(colors).toExtend<Readonly<Record<string, ColorDefinition>>>();
    expectTypeOf(shadows).toExtend<
      Readonly<Record<string, ShadowDefinition>>
    >();
    expectTypeOf(heights).toExtend<
      Readonly<Record<string, HeightDefinition>>
    >();
    expectTypeOf(widths).toExtend<Readonly<Record<string, WidthDefinition>>>();
    expectTypeOf(textRoles).toExtend<
      Readonly<Record<string, TextRoleDefinition>>
    >();
    expectTypeOf(displayRoles).toExtend<
      Readonly<Record<string, DisplayRoleDefinition>>
    >();
    expectTypeOf(space).toExtend<Readonly<Record<string, number>>>();
  });

  it("use lowercase hex or rgba for every color", () => {
    for (const [name, definition] of Object.entries(colors)) {
      for (const scheme of SCHEMES) {
        expect(definition[scheme], `${name} (${scheme})`).toMatch(COLOR);
      }
    }
  });
});

describe("contrast", () => {
  for (const scheme of SCHEMES) {
    it(`passes for every declared pair in ${scheme}`, () => {
      const failures = contrastPairs
        .map((pair) => ({
          pair: `${pair.text} on ${pair.on}`,
          ratio: contrastRatio(
            colors[pair.text][scheme],
            colors[pair.on][scheme],
          ),
          minimum: pair.minimum,
        }))
        .filter(({ ratio, minimum }) => ratio < minimum)
        .map(
          ({ pair, ratio, minimum }) =>
            `${pair}: ${ratio.toFixed(2)} < ${String(minimum)}`,
        );
      expect(failures).toEqual([]);
    });
  }
});

describe("charts", () => {
  it("start from the accent and keep every series 3:1 on the surfaces they sit on", () => {
    expect(colors["chart-1"].light).toBe(colors.accent.light);
    expect(colors["chart-1"].dark).toBe(colors.accent.dark);
    const series = Object.keys(colors).filter((name) =>
      name.startsWith("chart-"),
    );
    expect(series).toHaveLength(5);
    for (const name of series) {
      expect(
        contrastPairs.filter((pair) => pair.text === name).length,
        name,
      ).toBeGreaterThan(0);
    }
  });
});

describe("scales", () => {
  it("keep spacing on the 4px grid, except the 2px and 6px half steps", () => {
    for (const [step, px] of Object.entries(space)) {
      expect(
        px % 4 === 0 || px === 2 || px === 6,
        `space ${step} = ${String(px)}px`,
      ).toBe(true);
    }
    expect(spaceWell % 4).toBe(0);
  });

  it("never shrink standalone buttons below 28px", () => {
    expect(heights.sm.compact).toBeGreaterThanOrEqual(28);
    for (const [name, definition] of Object.entries(heights)) {
      expect(definition.compact, name).toBeLessThanOrEqual(
        definition.comfortable,
      );
    }
  });

  it("keep concentric radius pairs concentric", () => {
    expect(radii["2xl"]).toBe(radii.lg + spaceWell);
    expect(radii.xl).toBe(radii.lg + space["0.5"]);
    expect(radii.md).toBe(radii.dialog - space["2"]);
  });
});
