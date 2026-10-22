import { contrastRatio } from "@buttery/core";
import { gradients, solids } from "@buttery/core/palettes";
import { anchors } from "@buttery/react";
import { describe, expect, it } from "vitest";
import { SAMPLE_DECK } from "./deck.ts";
import type { Slide } from "./deck.ts";
import { fileName } from "./export.ts";
import {
  INK_DARK,
  INK_LIGHT,
  anchorAt,
  anchorPull,
  boxLook,
  fillCss,
  fillStops,
  inkFor,
  nearestAnchor,
} from "./geometry.ts";

const quote = SAMPLE_DECK.slides.find((slide) => slide.id === "quote");

describe("inkFor", () => {
  it("writes every solid's words at AA contrast or better", () => {
    for (const { id, hex } of solids) {
      const ink = inkFor({ kind: "solid", preset: id });
      expect(contrastRatio(hex, ink), id).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps at least large-text contrast at both ends of every gradient", () => {
    for (const { id } of gradients) {
      const fill = { kind: "gradient", preset: id, angle: 135 } as const;
      const ink = inkFor(fill);
      for (const stop of fillStops(fill))
        expect(contrastRatio(stop, ink), id).toBeGreaterThanOrEqual(3);
    }
  });

  it("writes dark slides in the light ink and light ones in the dark ink", () => {
    expect(inkFor({ kind: "solid", preset: "espresso" })).toBe(INK_LIGHT);
    expect(inkFor({ kind: "solid", preset: "cream" })).toBe(INK_DARK);
  });
});

describe("fillCss", () => {
  it("draws a solid as its color and a gradient blended in OKLab at its angle", () => {
    const cream = solids.find(({ id }) => id === "cream");
    expect(fillCss({ kind: "solid", preset: "cream" })).toBe(cream?.hex);
    const mist = gradients.find(({ id }) => id === "mist");
    expect(fillCss({ kind: "gradient", preset: "mist", angle: 90 })).toBe(
      `linear-gradient(90deg in oklab, ${mist?.fromHex ?? ""}, ${mist?.toHex ?? ""})`,
    );
  });
});

describe("boxLook", () => {
  it("draws no box without one, and a lifted card in the box's colors with one", () => {
    if (!quote) throw new Error("The sample deck has no quote slide.");
    const none: Slide = { ...quote, box: "none" };
    expect(boxLook(none)).toEqual({
      fill: "transparent",
      ink: inkFor(quote.fill),
      depth: 0,
    });
    const dark = boxLook({ ...quote, box: "dark", depth: 60 });
    expect(dark.ink).toBe(INK_LIGHT);
    expect(dark.depth).toBeCloseTo(0.6);
  });
});

describe("anchors", () => {
  it("names each place by the way it pulls", () => {
    for (const anchor of anchors) {
      const { across, down } = anchorPull(anchor);
      expect(anchorAt(across, down)).toBe(anchor);
    }
  });

  it("lands words let go anywhere on the nearest place", () => {
    expect(nearestAnchor(0, 0)).toBe("top-left");
    expect(nearestAnchor(0.5, 0.5)).toBe("center");
    expect(nearestAnchor(0.9, 0.55)).toBe("right");
    expect(nearestAnchor(0.2, 1)).toBe("bottom-left");
    expect(nearestAnchor(0.7, 0.1)).toBe("top-right");
  });
});

describe("fileName", () => {
  it("names the image after the deck and the slide's number", () => {
    expect(fileName("Halfmoon for cafés", 3)).toBe("halfmoon-for-cafes-3.png");
    expect(fileName("  ", 1)).toBe("slide-1.png");
  });
});
