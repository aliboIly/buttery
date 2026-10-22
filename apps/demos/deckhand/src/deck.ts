import { gradients, solids } from "@buttery/core/palettes";
import type { Anchor } from "@buttery/react";

/** How a slide arranges its words: a title, a title over points, a row of big numbers, or a quote. */
export type Layout = "title" | "points" | "numbers" | "quote";

/** Which way a slide's lines run: from the start edge, centered, or from the end edge. */
export type Align = "start" | "center" | "end";

/** What sits behind a slide's words: nothing, a light card or a dark card. */
export type Box = "none" | "light" | "dark";

/** The deck's slide shape. */
export type SlideSize = "16:9" | "4:3" | "1:1" | "4:5";

/** What fills a slide: one of the palette's solids, or one of its gradients at an angle. */
export type Fill =
  | { readonly kind: "solid"; readonly preset: string }
  | {
      readonly kind: "gradient";
      readonly preset: string;
      readonly angle: number;
    };

/** One big number and what it counts. */
export interface Stat {
  readonly value: string;
  readonly label: string;
}

/** One slide: its words, how they're laid out and how it looks. */
export interface Slide {
  readonly id: string;
  readonly layout: Layout;
  /** The heading; on a quote slide, the quote itself. */
  readonly title: string;
  /** The line under the title, the note under points or numbers, or who said the quote. */
  readonly subtitle: string;
  /** The points, one per line. */
  readonly points: string;
  /** Three big numbers; one left empty doesn't show. */
  readonly stats: readonly Stat[];
  readonly align: Align;
  /** The words' size, as a percentage of the layout's own. */
  readonly size: number;
  /** Where the words sit on the slide. */
  readonly position: Anchor;
  readonly box: Box;
  /** How far the box lifts off the slide, from 0 to 100. */
  readonly depth: number;
  readonly fill: Fill;
}

/** The whole deck. */
export interface Deck {
  readonly name: string;
  readonly size: SlideSize;
  readonly slides: readonly Slide[];
}

/** Each slide shape's size in px, as a PNG of it comes out. The short side is always 1080. */
export const SLIDE_SIZES: Readonly<
  Record<SlideSize, { readonly width: number; readonly height: number }>
> = {
  "16:9": { width: 1920, height: 1080 },
  "4:3": { width: 1440, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
};

/** The slide shapes, as the slide size list names them. */
export const SIZE_OPTIONS: readonly {
  readonly value: SlideSize;
  readonly label: string;
}[] = [
  { value: "16:9", label: "Wide · 16:9" },
  { value: "4:3", label: "Standard · 4:3" },
  { value: "1:1", label: "Square · 1:1" },
  { value: "4:5", label: "Portrait · 4:5" },
];

/** The layouts, as the layout list and the new slide menu name them. */
export const LAYOUT_OPTIONS: readonly {
  readonly value: Layout;
  readonly label: string;
}[] = [
  { value: "title", label: "Title" },
  { value: "points", label: "Title and points" },
  { value: "numbers", label: "Big numbers" },
  { value: "quote", label: "Quote" },
];

/** Where each layout puts its words, and which way they run, until someone moves them. */
export const LAYOUT_DEFAULTS: Readonly<
  Record<Layout, { readonly align: Align; readonly position: Anchor }>
> = {
  title: { align: "start", position: "bottom-left" },
  points: { align: "start", position: "left" },
  numbers: { align: "center", position: "center" },
  quote: { align: "start", position: "center" },
};

/** The words' size before anyone changes it. */
export const DEFAULT_TEXT_SIZE = 100;

/** The look a slide's Reset goes back to. */
export const LOOK_DEFAULTS: {
  readonly box: Box;
  readonly depth: number;
  readonly fill: Fill;
} = {
  box: "none",
  depth: 30,
  fill: { kind: "solid", preset: "paper" },
};

/** The angle a gradient runs at until someone turns it, as `gradientCss` draws it. */
export const DEFAULT_ANGLE = 135;

/** The words a new slide of each layout starts with, so it never opens blank. */
const PLACEHOLDERS: Readonly<
  Record<
    Layout,
    Partial<Pick<Slide, "title" | "subtitle" | "points" | "stats">>
  >
> = {
  title: {
    title: "A new title slide",
    subtitle: "Write its subtitle in the inspector",
  },
  points: {
    title: "A few points",
    points: "The first point\nThe second point\nThe third point",
  },
  numbers: {
    title: "By the numbers",
    stats: [
      { value: "12", label: "what the first one counts" },
      { value: "3", label: "what the second one counts" },
      { value: "40%", label: "what the third one counts" },
    ],
  },
  quote: {
    title: "A line someone said that's worth repeating.",
    subtitle: "Who said it, and where",
  },
};

const NO_STATS: readonly Stat[] = [
  { value: "", label: "" },
  { value: "", label: "" },
  { value: "", label: "" },
];

/** Whether a stat has anything to show. */
export function hasStat(stat: Stat): boolean {
  return stat.value.trim() !== "" || stat.label.trim() !== "";
}

/** The points a slide shows: its lines, without the empty ones. */
export function pointsOf(slide: Slide): readonly string[] {
  return slide.points
    .split("\n")
    .map((point) => point.trim())
    .filter((point) => point !== "");
}

/**
 * The slide in another layout. Its words carry over, the layout's own place and direction come with it,
 * and any words the new layout needs that the slide doesn't have start from the layout's placeholders.
 */
export function withLayout(slide: Slide, layout: Layout): Slide {
  const words = PLACEHOLDERS[layout];
  return {
    ...slide,
    layout,
    ...LAYOUT_DEFAULTS[layout],
    title: slide.title.trim() === "" ? (words.title ?? "") : slide.title,
    subtitle:
      slide.subtitle.trim() === "" ? (words.subtitle ?? "") : slide.subtitle,
    points:
      layout === "points" && pointsOf(slide).length === 0
        ? (words.points ?? "")
        : slide.points,
    stats:
      layout === "numbers" && !slide.stats.some(hasStat)
        ? (words.stats ?? NO_STATS)
        : slide.stats,
  };
}

/** A new slide of `layout`, with the look it continues from. */
export function newSlide(
  id: string,
  layout: Layout,
  look: Pick<Slide, "box" | "depth" | "fill"> = LOOK_DEFAULTS,
): Slide {
  return {
    id,
    layout,
    title: "",
    subtitle: "",
    points: "",
    stats: NO_STATS,
    ...LAYOUT_DEFAULTS[layout],
    size: DEFAULT_TEXT_SIZE,
    box: look.box,
    depth: look.depth,
    fill: look.fill,
    ...PLACEHOLDERS[layout],
  };
}

/** An id no slide in the deck has yet. */
export function nextSlideId(deck: Deck): string {
  const taken = deck.slides.map((slide) =>
    Number(/^slide-(\d+)$/.exec(slide.id)?.[1] ?? "0"),
  );
  return `slide-${String(Math.max(0, ...taken) + 1)}`;
}

/** Whether the slide section (direction, size and place) differs from its layout's defaults. */
export function placementChanged(slide: Slide): boolean {
  const defaults = LAYOUT_DEFAULTS[slide.layout];
  return (
    slide.align !== defaults.align ||
    slide.position !== defaults.position ||
    slide.size !== DEFAULT_TEXT_SIZE
  );
}

/** Whether the look section differs from its defaults. */
export function lookChanged(slide: Slide): boolean {
  return (
    slide.box !== LOOK_DEFAULTS.box ||
    slide.depth !== LOOK_DEFAULTS.depth ||
    slide.fill.kind !== LOOK_DEFAULTS.fill.kind ||
    slide.fill.preset !== LOOK_DEFAULTS.fill.preset
  );
}

/** The deck Deckhand opens on: Halfmoon Roastery's pitch to cafés for its wholesale coffee. */
export const SAMPLE_DECK: Deck = {
  name: "Halfmoon for cafés",
  size: "16:9",
  slides: [
    {
      ...newSlide("cover", "title"),
      title: "Halfmoon Roastery for your café",
      subtitle: "Wholesale coffee, roasted in Portland every Monday",
      fill: { kind: "gradient", preset: "espresso", angle: DEFAULT_ANGLE },
    },
    {
      ...newSlide("promise", "title"),
      title: "Roasted Monday, poured by Friday",
      subtitle:
        "We roast to order each week and deliver within 48 hours, so every bag on your shelf is days old, not months.",
      align: "center",
      position: "center",
      fill: { kind: "solid", preset: "cream" },
    },
    {
      ...newSlide("numbers", "numbers"),
      title: "A week with Halfmoon",
      stats: [
        { value: "48h", label: "from our roaster to your counter" },
        { value: "6", label: "coffees on the wholesale list" },
        { value: "8", label: "cafés already pour Halfmoon" },
      ],
      fill: { kind: "gradient", preset: "mist", angle: DEFAULT_ANGLE },
    },
    {
      ...newSlide("coffees", "points"),
      title: "The coffees on offer",
      points: [
        "Guji, Ethiopia: jasmine, peach",
        "Huila, Colombia: red apple, cocoa",
        "Cerrado, Brazil: hazelnut, toffee",
        "Nyeri, Kenya: blackcurrant, citrus",
        "Halfmoon House: our espresso blend",
      ].join("\n"),
    },
    {
      ...newSlide("quote", "quote"),
      title:
        "Our regulars noticed in the first week. The House blend pulls the same shot every morning, and the Guji sells out by Thursday.",
      subtitle: "Theo Okafor, owner of Little Fern Coffee",
      box: "light",
      depth: 40,
      fill: { kind: "gradient", preset: "peach", angle: DEFAULT_ANGLE },
    },
    {
      ...newSlide("next", "points"),
      title: "Start with a tasting",
      points: [
        "We bring three coffees to your bar",
        "Your team dials in shots with us",
        "Your first cases arrive Wednesday",
      ].join("\n"),
      subtitle: "Rosa Delgado · rosa@halfmoon.example",
      fill: { kind: "gradient", preset: "espresso", angle: DEFAULT_ANGLE },
    },
  ],
};

const LAYOUTS = new Set<string>(LAYOUT_OPTIONS.map(({ value }) => value));
const SIZES = new Set<string>(SIZE_OPTIONS.map(({ value }) => value));
const ALIGNS = new Set<string>(["start", "center", "end"]);
const BOXES = new Set<string>(["none", "light", "dark"]);
const ANCHORS = new Set<string>([
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
]);
const SOLIDS = new Set(solids.map(({ id }) => id));
const GRADIENTS = new Set(gradients.map(({ id }) => id));

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isListOf<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item,
): value is readonly Item[] {
  return Array.isArray(value) && value.every((item: unknown) => isItem(item));
}

function isBetween(value: unknown, low: number, high: number): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= low &&
    value <= high
  );
}

function isFill(value: unknown): value is Fill {
  if (!isRecord(value) || !isString(value["preset"])) return false;
  if (value["kind"] === "solid") return SOLIDS.has(value["preset"]);
  return (
    value["kind"] === "gradient" &&
    GRADIENTS.has(value["preset"]) &&
    isBetween(value["angle"], 0, 360)
  );
}

function isStat(value: unknown): value is Stat {
  return (
    isRecord(value) && isString(value["value"]) && isString(value["label"])
  );
}

function isSlide(value: unknown): value is Slide {
  if (!isRecord(value)) return false;
  const stats = value["stats"];
  return (
    isString(value["id"]) &&
    value["id"] !== "" &&
    isString(value["layout"]) &&
    LAYOUTS.has(value["layout"]) &&
    isString(value["title"]) &&
    isString(value["subtitle"]) &&
    isString(value["points"]) &&
    isListOf(stats, isStat) &&
    stats.length === 3 &&
    isString(value["align"]) &&
    ALIGNS.has(value["align"]) &&
    isBetween(value["size"], 50, 200) &&
    isString(value["position"]) &&
    ANCHORS.has(value["position"]) &&
    isString(value["box"]) &&
    BOXES.has(value["box"]) &&
    isBetween(value["depth"], 0, 100) &&
    isFill(value["fill"])
  );
}

/** Whether a value read back from storage is a whole deck, with ids that don't repeat. */
export function isDeck(value: unknown): value is Deck {
  if (!isRecord(value)) return false;
  const slides = value["slides"];
  return (
    isString(value["name"]) &&
    isString(value["size"]) &&
    SIZES.has(value["size"]) &&
    isListOf(slides, isSlide) &&
    new Set(slides.map((slide) => slide.id)).size === slides.length
  );
}
