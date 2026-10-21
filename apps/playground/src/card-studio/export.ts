import { hexToOklch, mixOklab, oklchToHex } from "@buttery/core";
import {
  FINISH_COLORS,
  LEAN_DEGREES,
  PERSPECTIVE,
  TITLE_LEADING,
  TITLE_SIZE,
  anchorShift,
  cardBox,
  cardShadow,
} from "./geometry.ts";
import type { CardBox } from "./geometry.ts";
import type { Card } from "./state.ts";

type Point = readonly [number, number];

const GRADIENT_STOPS = 24;
const MESH = 16;
const FONT = '"Inter Variable", "Inter Fallback", sans-serif';
/** The largest side and area a card's texture gets, inside what every browser can allocate. */
const TEXTURE_SIDE = 8192;
const TEXTURE_AREA = 32_000_000;

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Fills the canvas with a CSS-angle gradient, blended in OKLab like `gradientCss`. */
function paintGradient(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  from: string,
  to: string,
  angle: number,
): void {
  const turn = radians(angle);
  const dx = Math.sin(turn);
  const dy = -Math.cos(turn);
  const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
  const gradient = context.createLinearGradient(
    width / 2 - dx * half,
    height / 2 - dy * half,
    width / 2 + dx * half,
    height / 2 + dy * half,
  );
  const start = hexToOklch(from);
  const end = hexToOklch(to);
  for (let step = 0; step <= GRADIENT_STOPS; step += 1) {
    const share = step / GRADIENT_STOPS;
    gradient.addColorStop(share, oklchToHex(mixOklab(start, end, share)));
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

async function paintBackdrop(
  context: CanvasRenderingContext2D,
  card: Card,
): Promise<void> {
  const { backdrop, width, height } = card;
  switch (backdrop.kind) {
    case "blend":
      paintGradient(
        context,
        width,
        height,
        backdrop.from,
        backdrop.to,
        backdrop.sweep,
      );
      return;
    case "flat":
      context.fillStyle = backdrop.color;
      context.fillRect(0, 0, width, height);
      return;
    case "picture": {
      const image = await loadImage(backdrop.url);
      const cover = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const drawnWidth = image.naturalWidth * cover;
      const drawnHeight = image.naturalHeight * cover;
      context.drawImage(
        image,
        (width - drawnWidth) / 2,
        (height - drawnHeight) / 2,
        drawnWidth,
        drawnHeight,
      );
      return;
    }
    default: {
      const unknown: never = backdrop;
      return unknown;
    }
  }
}

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * The title broken into lines that fit `room`: at spaces, and inside a word that's wider than a line, as
 * CSS's `overflow-wrap: anywhere` breaks it.
 */
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  room: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  const fits = (candidate: string): boolean =>
    context.measureText(candidate).width <= room;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const joined = line === "" ? word : `${line} ${word}`;
    if (fits(joined)) {
      line = joined;
      continue;
    }
    if (line !== "") lines.push(line);
    line = "";
    if (fits(word)) {
      line = word;
      continue;
    }
    for (const { segment } of graphemes.segment(word)) {
      if (line !== "" && !fits(line + segment)) {
        lines.push(line);
        line = segment;
      } else {
        line += segment;
      }
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

/** The card's face, flat: its fill, its shadow and its title, with room around it for the shadow. */
interface Face {
  readonly canvas: HTMLCanvasElement;
  /** How far the texture reaches past the card on each side, in canvas pixels. */
  readonly margin: number;
}

function paintFace(card: Card, box: CardBox, density: number): Face {
  const colors = FINISH_COLORS[card.finish];
  const shadow = cardShadow(card);
  const margin = colors.fill
    ? Math.ceil(1.5 * shadow.blur + shadow.offsetY)
    : 0;
  const width = box.width + 2 * margin;
  const height = box.height + 2 * margin;
  const pixels = Math.min(
    density,
    TEXTURE_SIDE / Math.max(width, height),
    Math.sqrt(TEXTURE_AREA / (width * height)),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * pixels);
  canvas.height = Math.ceil(height * pixels);
  const context = canvas.getContext("2d");
  if (!context) return { canvas, margin };
  context.scale(pixels, pixels);
  context.translate(margin, margin);
  const radius = Math.min(card.corners, box.width / 2, box.height / 2);
  if (colors.fill) {
    context.save();
    context.shadowColor = shadow.color;
    context.shadowBlur = shadow.blur * pixels;
    context.shadowOffsetY = shadow.offsetY * pixels;
    context.fillStyle = colors.fill;
    context.beginPath();
    context.roundRect(0, 0, box.width, box.height, radius);
    context.fill();
    context.restore();
  }
  context.save();
  context.beginPath();
  context.roundRect(0, 0, box.width, box.height, radius);
  context.clip();
  const size = box.width * TITLE_SIZE;
  context.font = `600 ${String(size)}px ${FONT}`;
  context.letterSpacing = `${String(-0.01 * size)}px`;
  context.fillStyle = colors.ink;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const lines = wrap(context, card.title, box.width - 2 * card.spacing);
  const lineHeight = size * TITLE_LEADING;
  const top = box.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  for (const [index, line] of lines.entries()) {
    context.fillText(line, box.width / 2, top + index * lineHeight);
  }
  context.restore();
  return { canvas, margin };
}

/**
 * Where a point of the card lands on the canvas: rotateY, then rotateX, then rotate, then scale, all about
 * the card's center, then the shift toward its anchor, seen through the perspective from the card's
 * unshifted center, in the order Motion writes the transform. `scale()` is 2D, so depth isn't scaled.
 */
function projector(card: Card, box: CardBox): (u: number, v: number) => Point {
  const leanY = radians(card.lean.x * LEAN_DEGREES);
  const leanX = radians(-card.lean.y * LEAN_DEGREES);
  const turn = radians(card.turn);
  const scale = card.scale / 100;
  const distance = PERSPECTIVE * card.width;
  const shift = anchorShift(card);
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  return (u, v) => {
    const x1 = u * Math.cos(leanY);
    const z1 = -u * Math.sin(leanY);
    const y2 = v * Math.cos(leanX) - z1 * Math.sin(leanX);
    const z2 = v * Math.sin(leanX) + z1 * Math.cos(leanX);
    const x3 = x1 * Math.cos(turn) - y2 * Math.sin(turn);
    const y3 = x1 * Math.sin(turn) + y2 * Math.cos(turn);
    const depth = distance / (distance - z2);
    return [
      centerX + (shift.x * box.width + x3 * scale) * depth,
      centerY + (shift.y * box.height + y3 * scale) * depth,
    ];
  };
}

/** Draws the texture triangle `source` onto the canvas triangle `target`, mapping one to the other. */
function drawTriangle(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  source: readonly [Point, Point, Point],
  target: readonly [Point, Point, Point],
): void {
  const [[sx0, sy0], [sx1, sy1], [sx2, sy2]] = source;
  const [[tx0, ty0], [tx1, ty1], [tx2, ty2]] = target;
  const det = (sx1 - sx0) * (sy2 - sy0) - (sx2 - sx0) * (sy1 - sy0);
  if (det === 0) return;
  const a = ((tx1 - tx0) * (sy2 - sy0) - (tx2 - tx0) * (sy1 - sy0)) / det;
  const b = ((ty1 - ty0) * (sy2 - sy0) - (ty2 - ty0) * (sy1 - sy0)) / det;
  const c = ((tx2 - tx0) * (sx1 - sx0) - (tx1 - tx0) * (sx2 - sx0)) / det;
  const d = ((ty2 - ty0) * (sx1 - sx0) - (ty1 - ty0) * (sx2 - sx0)) / det;
  const e = tx0 - a * sx0 - c * sy0;
  const f = ty0 - b * sx0 - d * sy0;
  const middleX = (tx0 + tx1 + tx2) / 3;
  const middleY = (ty0 + ty1 + ty2) / 3;
  // Each triangle grows a little past its edges, so neighbours overlap and no seam shows between them.
  const grow = (x: number, y: number): Point => {
    const length = Math.hypot(x - middleX, y - middleY) || 1;
    return [
      x + ((x - middleX) / length) * 0.6,
      y + ((y - middleY) / length) * 0.6,
    ];
  };
  context.save();
  context.beginPath();
  context.moveTo(...grow(tx0, ty0));
  context.lineTo(...grow(tx1, ty1));
  context.lineTo(...grow(tx2, ty2));
  context.closePath();
  context.clip();
  context.transform(a, b, c, d, e, f);
  context.drawImage(image, 0, 0);
  context.restore();
}

/** Draws the card at the size it's set to, as the stage shows it, and returns the canvas. */
export async function renderCard(
  card: Card,
  scale: 1 | 2,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(card.width * scale);
  canvas.height = Math.round(card.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't draw to a canvas.");
  context.scale(scale, scale);
  await paintBackdrop(context, card);

  const box = cardBox(card);
  const project = projector(card, box);
  const face = paintFace(card, box, scale * 2);
  const left = -box.width / 2 - face.margin;
  const top = -box.height / 2 - face.margin;
  const spanX = box.width + 2 * face.margin;
  const spanY = box.height + 2 * face.margin;
  const texture = (u: number, v: number): Point => [
    ((u - left) / spanX) * face.canvas.width,
    ((v - top) / spanY) * face.canvas.height,
  ];
  for (let row = 0; row < MESH; row += 1) {
    for (let column = 0; column < MESH; column += 1) {
      const u0 = left + (spanX * column) / MESH;
      const u1 = left + (spanX * (column + 1)) / MESH;
      const v0 = top + (spanY * row) / MESH;
      const v1 = top + (spanY * (row + 1)) / MESH;
      drawTriangle(
        context,
        face.canvas,
        [texture(u0, v0), texture(u1, v0), texture(u0, v1)],
        [project(u0, v0), project(u1, v0), project(u0, v1)],
      );
      drawTriangle(
        context,
        face.canvas,
        [texture(u1, v0), texture(u1, v1), texture(u0, v1)],
        [project(u1, v0), project(u1, v1), project(u0, v1)],
      );
    }
  }
  return canvas;
}

/** The canvas as an image file. */
export async function cardBlob(
  card: Card,
  format: "png" | "jpg",
  scale: 1 | 2,
): Promise<Blob> {
  const canvas = await renderCard(card, scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The card couldn't be drawn."));
      },
      format === "png" ? "image/png" : "image/jpeg",
      0.92,
    );
  });
}

/** A file name from the card's title. */
export function fileName(card: Card, format: "png" | "jpg"): string {
  const slug = card.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug === "" ? "card" : slug}.${format}`;
}
