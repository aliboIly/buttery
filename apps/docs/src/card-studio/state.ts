import type { Anchor, TiltValue } from "@buttery/react";
import { gradients, solids } from "@buttery/core/palettes";

/** How the card is drawn: the title alone, on a paper card, or on a graphite card. */
export type Finish = "clear" | "paper" | "graphite";

/** The canvas shapes the select offers; `custom` is a size typed in or set by resizing. */
export type Shape = "fit" | "16:9" | "4:3" | "1:1" | "3:2" | "9:16" | "custom";

/** What's behind the card: a blend of two hues, one flat hue, or a picture. */
export type Backdrop =
  | {
      readonly kind: "blend";
      readonly preset: string | null;
      readonly from: string;
      readonly to: string;
      readonly sweep: number;
    }
  | {
      readonly kind: "flat";
      readonly preset: string | null;
      readonly color: string;
    }
  | { readonly kind: "picture"; readonly url: string; readonly name: string };

/** Everything that makes a card. */
export interface Card {
  readonly title: string;
  readonly finish: Finish;
  readonly scale: number;
  readonly corners: number;
  readonly spacing: number;
  readonly depth: number;
  readonly turn: number;
  readonly lean: TiltValue;
  readonly anchor: Anchor;
  readonly backdrop: Backdrop;
  readonly shape: Shape;
  readonly width: number;
  readonly height: number;
}

/** The card's own shape, which "Fit to card" gives the canvas. */
export const CARD_RATIO = 1.6;

/** Output sizes for the preset shapes, at 1920 on the long side. */
export const SHAPE_SIZES: Readonly<
  Record<
    Exclude<Shape, "custom">,
    { readonly width: number; readonly height: number }
  >
> = {
  fit: { width: 1920, height: 1200 },
  "16:9": { width: 1920, height: 1080 },
  "4:3": { width: 1920, height: 1440 },
  "1:1": { width: 1920, height: 1920 },
  "3:2": { width: 1920, height: 1280 },
  "9:16": { width: 1080, height: 1920 },
};

/** A blended backdrop. */
export type BlendBackdrop = Extract<Backdrop, { readonly kind: "blend" }>;

/** The direction a new blend runs, in degrees. */
export const DEFAULT_SWEEP = 160;

const LILAC = gradients.find((preset) => preset.id === "lilac");

/** A blend from a preset id, running at `sweep` degrees. */
export function blendFrom(id: string, sweep = DEFAULT_SWEEP): BlendBackdrop {
  const preset = gradients.find((candidate) => candidate.id === id) ?? LILAC;
  return {
    kind: "blend",
    preset: preset?.id ?? null,
    from: preset?.fromHex ?? "#c7d2fe",
    to: preset?.toHex ?? "#f5d0fe",
    sweep,
  };
}

/** A flat backdrop from a preset id. */
export function flatFrom(id: string): Backdrop {
  const preset = solids.find((candidate) => candidate.id === id) ?? solids[0];
  return {
    kind: "flat",
    preset: preset?.id ?? null,
    color: preset?.hex ?? "#e4e4e7",
  };
}

/** The card section's defaults. */
export const CARD_DEFAULTS = {
  finish: "graphite",
  corners: 16,
  spacing: 40,
  depth: 30,
} as const satisfies Partial<Card>;

/** The placement section's defaults. */
export const PLACEMENT_DEFAULTS = {
  scale: 75,
  turn: 0,
  lean: { x: 0, y: 0 },
  anchor: "center",
} as const satisfies Partial<Card>;

/** The backdrop section's default. */
export const BACKDROP_DEFAULT: Backdrop = blendFrom("lilac");

/** A new card. */
export function newCard(): Card {
  return {
    title: "Launch card",
    ...CARD_DEFAULTS,
    ...PLACEMENT_DEFAULTS,
    backdrop: BACKDROP_DEFAULT,
    shape: "16:9",
    ...SHAPE_SIZES["16:9"],
  };
}

/** Whether the card section differs from its defaults. */
export function cardChanged(card: Card): boolean {
  return (
    card.finish !== CARD_DEFAULTS.finish ||
    card.corners !== CARD_DEFAULTS.corners ||
    card.spacing !== CARD_DEFAULTS.spacing ||
    card.depth !== CARD_DEFAULTS.depth
  );
}

/** Whether the placement section differs from its defaults. */
export function placementChanged(card: Card): boolean {
  return (
    card.scale !== PLACEMENT_DEFAULTS.scale ||
    card.turn !== PLACEMENT_DEFAULTS.turn ||
    card.lean.x !== 0 ||
    card.lean.y !== 0 ||
    card.anchor !== PLACEMENT_DEFAULTS.anchor
  );
}

/** Whether the backdrop differs from its default. */
export function backdropChanged(card: Card): boolean {
  const backdrop = card.backdrop;
  return (
    backdrop.kind !== "blend" ||
    backdrop.preset !== "lilac" ||
    backdrop.sweep !== DEFAULT_SWEEP
  );
}

function sameBackdrop(a: Backdrop, b: Backdrop): boolean {
  switch (a.kind) {
    case "blend":
      return (
        b.kind === "blend" &&
        a.preset === b.preset &&
        a.from === b.from &&
        a.to === b.to &&
        a.sweep === b.sweep
      );
    case "flat":
      return b.kind === "flat" && a.preset === b.preset && a.color === b.color;
    case "picture":
      return b.kind === "picture" && a.url === b.url;
    default: {
      const unknown: never = a;
      return unknown;
    }
  }
}

/** Whether two cards look the same, so a change between them isn't worth an undo step. */
export function sameCard(a: Card | null, b: Card | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.title === b.title &&
    a.finish === b.finish &&
    a.scale === b.scale &&
    a.corners === b.corners &&
    a.spacing === b.spacing &&
    a.depth === b.depth &&
    a.turn === b.turn &&
    a.lean.x === b.lean.x &&
    a.lean.y === b.lean.y &&
    a.anchor === b.anchor &&
    sameBackdrop(a.backdrop, b.backdrop) &&
    a.shape === b.shape &&
    a.width === b.width &&
    a.height === b.height
  );
}

/** The studio: the card (or none, after a delete) and its history. */
export interface Studio {
  readonly card: Card | null;
  readonly past: readonly (Card | null)[];
  readonly future: readonly (Card | null)[];
  /** What the open step is changing, so a drag's many changes are one step; `null` once it's sealed. */
  readonly open: string | null;
}

/** A change to the studio. */
export type StudioAction =
  | {
      readonly type: "change";
      readonly key: string;
      readonly change: (card: Card) => Card;
    }
  | { readonly type: "seal" }
  | { readonly type: "set"; readonly card: Card | null }
  | { readonly type: "undo" }
  | { readonly type: "redo" }
  /** Brings a deleted card back, as Undo does, but only while there's no card. */
  | { readonly type: "restore" }
  /** Takes back the open step for `key` as if it never happened, with nothing to redo. */
  | { readonly type: "drop"; readonly key: string };

const HISTORY = 100;

/** The studio as it starts: a new card and no history. */
export const STUDIO_START: Studio = {
  card: newCard(),
  past: [],
  future: [],
  open: null,
};

/**
 * Applies a change, keeping an undo history: changes to the same thing join one step until it's sealed,
 * as a drag's commit or a discrete pick does, so a whole drag undoes at once. A change that changes
 * nothing isn't a step, and a step that ends where it began is dropped when it's sealed.
 */
export function studioReducer(studio: Studio, action: StudioAction): Studio {
  switch (action.type) {
    case "change": {
      const base = studio.card ?? newCard();
      const next = action.change(base);
      const joining = studio.card !== null && studio.open === action.key;
      if (!joining && sameCard(next, studio.card)) return studio;
      return {
        card: next,
        past: joining
          ? studio.past
          : [...studio.past, studio.card].slice(-HISTORY),
        future: [],
        open: action.key,
      };
    }
    case "seal": {
      if (studio.open === null) return studio;
      const before = studio.past.at(-1);
      return before !== undefined && sameCard(before, studio.card)
        ? { ...studio, past: studio.past.slice(0, -1), open: null }
        : { ...studio, open: null };
    }
    case "set":
      return {
        card: action.card,
        past: [...studio.past, studio.card].slice(-HISTORY),
        future: [],
        open: null,
      };
    case "undo": {
      const previous = studio.past.at(-1);
      if (previous === undefined) return studio;
      return {
        card: previous,
        past: studio.past.slice(0, -1),
        future: [studio.card, ...studio.future],
        open: null,
      };
    }
    case "redo": {
      const [next, ...rest] = studio.future;
      if (next === undefined) return studio;
      return {
        card: next,
        past: [...studio.past, studio.card],
        future: rest,
        open: null,
      };
    }
    case "restore":
      return studio.card === null
        ? studioReducer(studio, { type: "undo" })
        : studio;
    case "drop": {
      const previous = studio.past.at(-1);
      if (studio.open !== action.key || previous === undefined) return studio;
      return {
        card: previous,
        past: studio.past.slice(0, -1),
        future: studio.future,
        open: null,
      };
    }
    default: {
      const unknown: never = action;
      return unknown;
    }
  }
}
