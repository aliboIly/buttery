import { solids } from "@buttery/core/palettes";
import type { Anchor } from "@buttery/react";
import type { Card, Finish } from "./state.ts";
import { CARD_RATIO } from "./state.ts";

/** The space kept around the card, as a share of the canvas's shorter side. */
export const MARGIN = 0.06;
/** The title's size, as a share of the card's width. */
export const TITLE_SIZE = 0.085;
/** The title's line height, as a multiple of its size. */
export const TITLE_LEADING = 1.15;
/** The 3D perspective, as a share of the canvas's width: about 1200px on a canvas 1100px wide. */
export const PERSPECTIVE = 1.1;
/** How far a full lean turns the card. */
export const LEAN_DEGREES = 20;

const PAPER = solids.find((solid) => solid.id === "paper")?.hex ?? "#f7f3ec";
const GRAPHITE =
  solids.find((solid) => solid.id === "graphite")?.hex ?? "#2a2b2e";

/** The card's fill and ink for each finish. */
export const FINISH_COLORS: Readonly<
  Record<Finish, { readonly fill: string | null; readonly ink: string }>
> = {
  clear: { fill: null, ink: GRAPHITE },
  paper: { fill: PAPER, ink: GRAPHITE },
  graphite: { fill: GRAPHITE, ink: PAPER },
};

/** Where the card sits and how big it is, in canvas pixels, before scale, turn and lean. */
export interface CardBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Which way the card's anchor pulls it: -1 to the left or top, 1 to the right or bottom, 0 to the middle. */
export function anchorPull(anchor: Anchor): {
  readonly across: -1 | 0 | 1;
  readonly down: -1 | 0 | 1;
} {
  return {
    across: anchor.endsWith("left") ? -1 : anchor.endsWith("right") ? 1 : 0,
    down: anchor.startsWith("top") ? -1 : anchor.startsWith("bottom") ? 1 : 0,
  };
}

/** The card's box on a canvas of the card's size, placed at its anchor, before its scale shrinks it. */
export function cardBox(card: Card): CardBox {
  const margin = MARGIN * Math.min(card.width, card.height);
  const roomWidth = card.width - 2 * margin;
  const roomHeight = card.height - 2 * margin;
  const width = Math.min(roomWidth, roomHeight * CARD_RATIO);
  const height = width / CARD_RATIO;
  const { across, down } = anchorPull(card.anchor);
  return {
    x: margin + ((roomWidth - width) * (across + 1)) / 2,
    y: margin + ((roomHeight - height) * (down + 1)) / 2,
    width,
    height,
  };
}

/**
 * How far the card moves toward its anchor once its scale shrinks it, as a share of its own width and
 * height, so a smaller card still meets the margin on the anchored side.
 */
export function anchorShift(card: Card): {
  readonly x: number;
  readonly y: number;
} {
  const { across, down } = anchorPull(card.anchor);
  const slack = (1 - card.scale / 100) / 2;
  return { x: across * slack, y: down * slack };
}

/** The card's shadow at its depth: its offset and blur in canvas pixels, and its color. */
export function cardShadow(card: Card): {
  readonly offsetY: number;
  readonly blur: number;
  readonly color: string;
} {
  const strength = card.finish === "clear" ? 0 : card.depth / 100;
  const alpha = Math.round(strength * 0.5 * 255)
    .toString(16)
    .padStart(2, "0");
  return {
    offsetY: strength * 0.03 * card.width,
    blur: strength * 0.08 * card.width,
    color: `${GRAPHITE}${alpha}`,
  };
}
