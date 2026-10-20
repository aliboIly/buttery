import { hexToOklch, mixOklab, oklchToHex } from "@buttery/core";
import {
  EDGE_COLORS,
  PERSPECTIVE,
  TILT_DEGREES,
  TITLE_SIZE,
  cardBox,
  cardShadow,
} from "./geometry.ts";
import type { Card } from "./state.ts";

type Point = readonly [number, number];

const GRADIENT_STOPS = 24;
const MESH = 16;
const CORNER_STEPS = 8;
const FONT = '"Inter Variable", "Inter Fallback", sans-serif';

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

async function paintBackground(
  context: CanvasRenderingContext2D,
  card: Card,
): Promise<void> {
  const { background, width, height } = card;
  switch (background.kind) {
    case "gradient":
      paintGradient(
        context,
        width,
        height,
        background.from,
        background.to,
        background.angle,
      );
      return;
    case "solid":
      context.fillStyle = background.color;
      context.fillRect(0, 0, width, height);
      return;
    case "image": {
      const image = await loadImage(background.url);
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
      const unknown: never = background;
      return unknown;
    }
  }
}

/** The title broken into lines that fit `room`, as CSS wraps it. */
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  room: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line === "" ? word : `${line} ${word}`;
    if (context.measureText(next).width <= room || line === "") {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

/** The card's face, flat, at its size in canvas pixels. */
function paintFace(
  card: Card,
  width: number,
  height: number,
  density: number,
): HTMLCanvasElement {
  const face = document.createElement("canvas");
  face.width = Math.ceil(width * density);
  face.height = Math.ceil(height * density);
  const context = face.getContext("2d");
  if (!context) return face;
  context.scale(density, density);
  const colors = EDGE_COLORS[card.edge];
  if (colors.fill) {
    context.fillStyle = colors.fill;
    context.beginPath();
    context.roundRect(
      0,
      0,
      width,
      height,
      Math.min(card.roundness, width / 2, height / 2),
    );
    context.fill();
  }
  const size = width * TITLE_SIZE;
  context.font = `600 ${String(size)}px ${FONT}`;
  context.letterSpacing = `${String(-0.01 * size)}px`;
  context.fillStyle = colors.ink;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const lines = wrap(context, card.title, width - 2 * card.padding);
  const lineHeight = size * 1.15;
  const top = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  for (const [index, line] of lines.entries()) {
    context.fillText(line, width / 2, top + index * lineHeight);
  }
  return face;
}

/**
 * Where a point of the card lands on the canvas: rotateY, then rotateX, then rotate, then scale, all about
 * the card's center, seen through the perspective, in the order Motion writes the transform.
 */
function projector(card: Card, center: Point): (u: number, v: number) => Point {
  const tiltY = radians(card.tilt.x * TILT_DEGREES);
  const tiltX = radians(-card.tilt.y * TILT_DEGREES);
  const turn = radians(card.rotation);
  const scale = card.scale / 100;
  const distance = PERSPECTIVE * card.width;
  return (u, v) => {
    const x1 = u * Math.cos(tiltY);
    const z1 = -u * Math.sin(tiltY);
    const y2 = v * Math.cos(tiltX) - z1 * Math.sin(tiltX);
    const z2 = v * Math.sin(tiltX) + z1 * Math.cos(tiltX);
    const x3 = x1 * Math.cos(turn) - y2 * Math.sin(turn);
    const y3 = x1 * Math.sin(turn) + y2 * Math.cos(turn);
    const depth = distance / (distance - z2);
    return [center[0] + x3 * scale * depth, center[1] + y3 * scale * depth];
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
  context.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    0,
    0,
    image.width,
    image.height,
  );
  context.restore();
}

/** The outline of the card's rounded rectangle, as points around its center. */
function outline(width: number, height: number, radius: number): Point[] {
  const corner = Math.min(radius, width / 2, height / 2);
  const points: Point[] = [];
  const corners: readonly [number, number, number][] = [
    [width / 2 - corner, -height / 2 + corner, -90],
    [width / 2 - corner, height / 2 - corner, 0],
    [-width / 2 + corner, height / 2 - corner, 90],
    [-width / 2 + corner, -height / 2 + corner, 180],
  ];
  for (const [x, y, start] of corners) {
    for (let step = 0; step <= CORNER_STEPS; step += 1) {
      const angle = radians(start + (90 * step) / CORNER_STEPS);
      points.push([x + Math.cos(angle) * corner, y + Math.sin(angle) * corner]);
    }
  }
  return points;
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
  await paintBackground(context, card);

  const box = cardBox(card);
  const center: Point = [box.x + box.width / 2, box.y + box.height / 2];
  const project = projector(card, center);
  const colors = EDGE_COLORS[card.edge];

  if (colors.fill) {
    const shadow = cardShadow(card);
    const edge = outline(box.width, box.height, card.roundness).map(([u, v]) =>
      project(u, v),
    );
    context.save();
    context.shadowColor = shadow.color;
    context.shadowBlur = shadow.blur * scale;
    context.shadowOffsetY = shadow.offsetY * scale;
    context.fillStyle = colors.fill;
    context.beginPath();
    for (const [index, [x, y]] of edge.entries()) {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
    context.restore();
  }

  const face = paintFace(card, box.width, box.height, scale * 2);
  const texture = (u: number, v: number): Point => [
    ((u + box.width / 2) / box.width) * face.width,
    ((v + box.height / 2) / box.height) * face.height,
  ];
  for (let row = 0; row < MESH; row += 1) {
    for (let column = 0; column < MESH; column += 1) {
      const u0 = -box.width / 2 + (box.width * column) / MESH;
      const u1 = -box.width / 2 + (box.width * (column + 1)) / MESH;
      const v0 = -box.height / 2 + (box.height * row) / MESH;
      const v1 = -box.height / 2 + (box.height * (row + 1)) / MESH;
      drawTriangle(
        context,
        face,
        [texture(u0, v0), texture(u1, v0), texture(u0, v1)],
        [project(u0, v0), project(u1, v0), project(u0, v1)],
      );
      drawTriangle(
        context,
        face,
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
