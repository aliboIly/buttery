import { contrastRatio } from "@buttery/core";
import { gradients, solids } from "@buttery/core/palettes";
import type { Anchor } from "@buttery/react";
import type { Box, Fill, Slide } from "./deck.ts";

function gradient(id: string): (typeof gradients)[number] {
  const preset = gradients.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`The palettes have no gradient called ${id}.`);
  return preset;
}

function solid(id: string): string {
  const preset = solids.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`The palettes have no solid called ${id}.`);
  return preset.hex;
}

/** The ink for light slides: the deep end of the graphite gradient. */
export const INK_DARK: string = gradient("graphite").toHex;
/** The ink for dark slides: the light end of the paper gradient. */
export const INK_LIGHT: string = gradient("paper").fromHex;
/** The room a presentation plays in: as deep as the dark ink. */
export const SCREEN: string = INK_DARK;

const GRAPHITE = solid("graphite");

/** The fill and ink of each box behind a slide's words. */
export const BOX_COLORS: Readonly<
  Record<Exclude<Box, "none">, { readonly fill: string; readonly ink: string }>
> = {
  light: { fill: solid("paper"), ink: INK_DARK },
  dark: { fill: GRAPHITE, ink: INK_LIGHT },
};

/** The colors a fill is made of: one for a solid, both stops for a gradient. */
export function fillStops(fill: Fill): readonly string[] {
  switch (fill.kind) {
    case "solid":
      return [solid(fill.preset)];
    case "gradient": {
      const preset = gradient(fill.preset);
      return [preset.fromHex, preset.toHex];
    }
    default: {
      const unknown: never = fill;
      return unknown;
    }
  }
}

/** A fill as CSS: a color, or a gradient blended in OKLab like `gradientCss`, at its angle. */
export function fillCss(fill: Fill): string {
  const [from = "", to = from] = fillStops(fill);
  return fill.kind === "solid"
    ? from
    : `linear-gradient(${String(fill.angle)}deg in oklab, ${from}, ${to})`;
}

/** The ink that reads best everywhere on a fill: whichever keeps the higher contrast at its worst stop. */
export function inkFor(fill: Fill): string {
  const stops = fillStops(fill);
  const worst = (ink: string): number =>
    Math.min(...stops.map((stop) => contrastRatio(stop, ink)));
  return worst(INK_DARK) >= worst(INK_LIGHT) ? INK_DARK : INK_LIGHT;
}

/** How the box behind the words is drawn: its fill, the words' ink, and how far it lifts. */
export function boxLook(slide: Slide): {
  readonly fill: string;
  readonly ink: string;
  readonly depth: number;
} {
  switch (slide.box) {
    case "none":
      return { fill: "transparent", ink: inkFor(slide.fill), depth: 0 };
    case "light":
    case "dark":
      return { ...BOX_COLORS[slide.box], depth: slide.depth / 100 };
    default: {
      const unknown: never = slide.box;
      return unknown;
    }
  }
}

/** The box's shadow color: graphite, at a strength the shadow's size then spreads. */
export const SHADOW = `${GRAPHITE}4d`;

/** What each place on the slide is called. */
export const ANCHOR_NAMES: Readonly<Record<Anchor, string>> = {
  "top-left": "Top left",
  top: "Top",
  "top-right": "Top right",
  left: "Left",
  center: "Center",
  right: "Right",
  "bottom-left": "Bottom left",
  bottom: "Bottom",
  "bottom-right": "Bottom right",
};

type Pull = -1 | 0 | 1;

/** Which way a place pulls the words: -1 to the start or top, 1 to the end or bottom, 0 to the middle. */
export function anchorPull(anchor: Anchor): {
  readonly across: Pull;
  readonly down: Pull;
} {
  return {
    across: anchor.endsWith("left") ? -1 : anchor.endsWith("right") ? 1 : 0,
    down: anchor.startsWith("top") ? -1 : anchor.startsWith("bottom") ? 1 : 0,
  };
}

const ROWS: Readonly<Record<Pull, readonly [Anchor, Anchor, Anchor]>> = {
  [-1]: ["top-left", "top", "top-right"],
  0: ["left", "center", "right"],
  1: ["bottom-left", "bottom", "bottom-right"],
};

/** The place that pulls `across` and `down`. */
export function anchorAt(across: Pull, down: Pull): Anchor {
  const row = ROWS[down];
  return across === -1 ? row[0] : across === 0 ? row[1] : row[2];
}

function pullOf(share: number): Pull {
  return share < 1 / 3 ? -1 : share > 2 / 3 ? 1 : 0;
}

/**
 * The place nearest where the words were let go, given as shares of the room around them: 0 when they
 * touch the start or top edge, 1 the end or bottom edge.
 */
export function nearestAnchor(across: number, down: number): Anchor {
  return anchorAt(pullOf(across), pullOf(down));
}
