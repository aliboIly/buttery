import { solids } from "@buttery/core/palettes";
import type { Card, Edge } from "./state.ts";
import { CARD_RATIO } from "./state.ts";

/** The space kept around the card, as a share of the canvas's shorter side. */
export const MARGIN = 0.06;
/** The title's size, as a share of the card's width. */
export const TITLE_SIZE = 0.085;
/** The 3D perspective, as a share of the canvas's width: about 1200px on a canvas 1100px wide. */
export const PERSPECTIVE = 1.1;
/** How far a full tilt turns the card. */
export const TILT_DEGREES = 20;

const PAPER = solids.find((solid) => solid.id === "paper")?.hex ?? "#f7f3ec";
const GRAPHITE =
  solids.find((solid) => solid.id === "graphite")?.hex ?? "#2a2b2e";

/** The card's fill and ink for each edge style. */
export const EDGE_COLORS: Readonly<
  Record<Edge, { readonly fill: string | null; readonly ink: string }>
> = {
  none: { fill: null, ink: GRAPHITE },
  light: { fill: PAPER, ink: GRAPHITE },
  dark: { fill: GRAPHITE, ink: PAPER },
};

/** Where the card sits and how big it is, in canvas pixels, before scale, rotation and tilt. */
export interface CardBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The card's box on a canvas of the card's size, placed at its anchor. */
export function cardBox(card: Card): CardBox {
  const margin = MARGIN * Math.min(card.width, card.height);
  const roomWidth = card.width - 2 * margin;
  const roomHeight = card.height - 2 * margin;
  const width = Math.min(roomWidth, roomHeight * CARD_RATIO);
  const height = width / CARD_RATIO;
  const across = card.anchor.endsWith("left")
    ? 0
    : card.anchor.endsWith("right")
      ? 1
      : 0.5;
  const down = card.anchor.startsWith("top")
    ? 0
    : card.anchor.startsWith("bottom")
      ? 1
      : 0.5;
  return {
    x: margin + (roomWidth - width) * across,
    y: margin + (roomHeight - height) * down,
    width,
    height,
  };
}

/** The card's shadow at its strength: its offset and blur in canvas pixels, and its color. */
export function cardShadow(card: Card): {
  readonly offsetY: number;
  readonly blur: number;
  readonly color: string;
} {
  const strength = card.edge === "none" ? 0 : card.shadow / 100;
  const alpha = Math.round(strength * 0.5 * 255)
    .toString(16)
    .padStart(2, "0");
  return {
    offsetY: strength * 0.03 * card.width,
    blur: strength * 0.08 * card.width,
    color: `${GRAPHITE}${alpha}`,
  };
}
