import { hexToOklch, mixOklab, oklchToHex } from "@buttery/core";
import { SLIDE_SIZES } from "./deck.ts";
import type { Fill, SlideSize } from "./deck.ts";
import { fillStops } from "./geometry.ts";

const GRADIENT_STOPS = 24;

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Fills the canvas with a CSS-angle gradient, blended in OKLab as the stage draws it. */
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

function paintFill(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  fill: Fill,
): void {
  const [from = "", to = from] = fillStops(fill);
  if (fill.kind === "gradient") {
    paintGradient(context, width, height, from, to, fill.angle);
    return;
  }
  context.fillStyle = from;
  context.fillRect(0, 0, width, height);
}

function pixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Whether a computed color draws anything. */
function painted(color: string): boolean {
  return !/^(transparent|rgba\(.*,\s*0\))$/.test(color.trim());
}

interface Shadow {
  readonly color: string;
  readonly x: number;
  readonly y: number;
  readonly blur: number;
}

/** The first shadow in a computed `box-shadow`, such as `rgba(0, 0, 0, 0.4) 0px 12px 32px 0px`. */
function shadowOf(value: string): Shadow | null {
  if (value === "none") return null;
  const color = /(rgba?\([^)]*\)|#[\da-f]{3,8})/i.exec(value)?.[0];
  if (color === undefined) return null;
  const [x = 0, y = 0, blur = 0] = value
    .replace(color, "")
    .trim()
    .split(/\s+/)
    .map(pixels);
  return { color, x, y, blur };
}

interface Line {
  readonly text: string;
  readonly left: number;
  readonly top: number;
}

/**
 * The lines a piece of text shows, read from the page: the characters whose boxes share a top make a line,
 * which starts where its first character does.
 */
function linesOf(element: Element): Line[] {
  const lines: { text: string; left: number; top: number }[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    let offset = 0;
    for (const { segment } of graphemes.segment(text)) {
      range.setStart(node, offset);
      range.setEnd(node, offset + segment.length);
      offset += segment.length;
      const box = range.getClientRects()[0];
      const last = lines.at(-1);
      if (!box || box.width === 0) {
        if (last && /\s/.test(segment) && !last.text.endsWith(" "))
          last.text += " ";
        continue;
      }
      if (last && Math.abs(box.top - last.top) < box.height / 2) {
        last.text += segment;
      } else {
        lines.push({ text: segment, left: box.left, top: box.top });
      }
    }
  }
  return lines
    .map((line) => ({ ...line, text: line.text.trimEnd() }))
    .filter((line) => line.text !== "");
}

const metrics = new Map<string, { ascent: number; descent: number }>();

/** How far a font reaches above and below its baseline, as CSS lays out its lines. */
function fontMetrics(
  context: CanvasRenderingContext2D,
  font: string,
): { readonly ascent: number; readonly descent: number } {
  const known = metrics.get(font);
  if (known) return known;
  context.save();
  context.font = font;
  const measured = context.measureText("Hg");
  context.restore();
  const found = {
    ascent: measured.fontBoundingBoxAscent,
    descent: measured.fontBoundingBoxDescent,
  };
  metrics.set(font, found);
  return found;
}

/**
 * Draws the slide the stage shows, at its own size in px times `scale`: its fill, the box behind its words
 * with the box's shadow, its bullets, and every line of its text where the stage lays it out.
 */
export async function renderSlide(
  slide: HTMLElement,
  fill: Fill,
  size: SlideSize,
  scale: 1 | 2,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const { width, height } = SLIDE_SIZES[size];
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't draw to a canvas.");
  const frame = slide.getBoundingClientRect();
  const ratio = canvas.width / frame.width;
  const x = (value: number): number => (value - frame.left) * ratio;
  const y = (value: number): number => (value - frame.top) * ratio;

  paintFill(context, canvas.width, canvas.height, fill);

  for (const box of slide.querySelectorAll<HTMLElement>("[data-dh-box]")) {
    const style = getComputedStyle(box);
    if (!painted(style.backgroundColor)) continue;
    const rect = box.getBoundingClientRect();
    const shadow = shadowOf(style.boxShadow);
    context.save();
    if (shadow) {
      context.shadowColor = shadow.color;
      context.shadowOffsetX = shadow.x * ratio;
      context.shadowOffsetY = shadow.y * ratio;
      context.shadowBlur = shadow.blur * ratio;
    }
    context.fillStyle = style.backgroundColor;
    context.beginPath();
    context.roundRect(
      x(rect.left),
      y(rect.top),
      rect.width * ratio,
      rect.height * ratio,
      pixels(style.borderTopLeftRadius) * ratio,
    );
    context.fill();
    context.restore();
  }

  for (const dot of slide.querySelectorAll<HTMLElement>("[data-dh-dot]")) {
    const style = getComputedStyle(dot);
    const rect = dot.getBoundingClientRect();
    context.fillStyle = style.backgroundColor;
    context.beginPath();
    context.roundRect(
      x(rect.left),
      y(rect.top),
      rect.width * ratio,
      rect.height * ratio,
      pixels(style.borderTopLeftRadius) * ratio,
    );
    context.fill();
  }

  for (const text of slide.querySelectorAll<HTMLElement>("[data-dh-text]")) {
    const style = getComputedStyle(text);
    const fontSize = pixels(style.fontSize);
    const lineHeight = pixels(style.lineHeight) || fontSize * 1.2;
    const cssFont = `${style.fontWeight} ${String(fontSize)}px ${style.fontFamily}`;
    const { ascent, descent } = fontMetrics(context, cssFont);
    const top =
      text.getBoundingClientRect().top +
      pixels(style.paddingTop) +
      pixels(style.borderTopWidth);
    const lines = linesOf(text);
    const tops = [...new Set(lines.map((line) => Math.round(line.top)))].sort(
      (a, b) => a - b,
    );
    context.save();
    context.font = `${style.fontWeight} ${String(fontSize * ratio)}px ${style.fontFamily}`;
    context.letterSpacing = `${String(pixels(style.letterSpacing) * ratio)}px`;
    context.fillStyle = style.color;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    for (const line of lines) {
      const index = tops.indexOf(Math.round(line.top));
      const baseline =
        top +
        index * lineHeight +
        (lineHeight - (ascent + descent)) / 2 +
        ascent;
      context.fillText(line.text, x(line.left), y(baseline));
    }
    context.restore();
  }
  return canvas;
}

/** The slide as a PNG file. */
export async function slideBlob(
  slide: HTMLElement,
  fill: Fill,
  size: SlideSize,
  scale: 1 | 2 = 1,
): Promise<Blob> {
  const canvas = await renderSlide(slide, fill, size, scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The slide couldn't be drawn."));
    }, "image/png");
  });
}

/** A file name from the deck's name and the slide's number, such as `halfmoon-for-cafes-3.png`. */
export function fileName(deckName: string, number: number): string {
  const slug = deckName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug === "" ? "slide" : slug}-${String(number)}.png`;
}
