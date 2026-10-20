import type { Anchor, TiltValue } from "@buttery/react";
import { gradients, solids } from "@buttery/core/palettes";

/** How the card is drawn: no frame, a light card or a dark card. */
export type Edge = "none" | "light" | "dark";

/** The canvas shapes the select offers; `custom` is a size typed or cropped. */
export type Shape =
  "match" | "16:9" | "4:3" | "1:1" | "3:2" | "9:16" | "custom";

/** A canvas background. */
export type Background =
  | {
      readonly kind: "gradient";
      readonly preset: string | null;
      readonly from: string;
      readonly to: string;
      readonly angle: number;
    }
  | {
      readonly kind: "solid";
      readonly preset: string | null;
      readonly color: string;
    }
  | { readonly kind: "image"; readonly url: string; readonly name: string };

/** Everything that makes a card. */
export interface Card {
  readonly title: string;
  readonly edge: Edge;
  readonly scale: number;
  readonly roundness: number;
  readonly padding: number;
  readonly shadow: number;
  readonly rotation: number;
  readonly tilt: TiltValue;
  readonly anchor: Anchor;
  readonly background: Background;
  readonly shape: Shape;
  readonly width: number;
  readonly height: number;
}

/** The card's own shape, which "Match card" gives the canvas. */
export const CARD_RATIO = 1.6;

/** Output sizes for the preset shapes, at 1600 on the long side. */
export const SHAPE_SIZES: Readonly<
  Record<
    Exclude<Shape, "custom">,
    { readonly width: number; readonly height: number }
  >
> = {
  match: { width: 1600, height: 1000 },
  "16:9": { width: 1600, height: 900 },
  "4:3": { width: 1600, height: 1200 },
  "1:1": { width: 1600, height: 1600 },
  "3:2": { width: 1600, height: 1067 },
  "9:16": { width: 900, height: 1600 },
};

/** A gradient background. */
export type GradientBackground = Extract<
  Background,
  { readonly kind: "gradient" }
>;

const LILAC = gradients.find((preset) => preset.id === "lilac");

function presetBackground(id: string, angle = 135): GradientBackground {
  const preset = gradients.find((candidate) => candidate.id === id) ?? LILAC;
  return {
    kind: "gradient",
    preset: preset?.id ?? null,
    from: preset?.fromHex ?? "#c7d2fe",
    to: preset?.toHex ?? "#f5d0fe",
    angle,
  };
}

/** The card section's defaults. */
export const CARD_DEFAULTS = {
  edge: "dark",
  scale: 80,
  roundness: 12,
  padding: 32,
  shadow: 40,
} as const satisfies Partial<Card>;

/** The position section's defaults. */
export const POSITION_DEFAULTS = {
  rotation: 0,
  tilt: { x: 0, y: 0 },
  anchor: "center",
} as const satisfies Partial<Card>;

/** The background section's default. */
export const BACKGROUND_DEFAULT: Background = presetBackground("lilac");

/** A new card. */
export function newCard(): Card {
  return {
    title: "Launch card",
    ...CARD_DEFAULTS,
    ...POSITION_DEFAULTS,
    background: BACKGROUND_DEFAULT,
    shape: "16:9",
    ...SHAPE_SIZES["16:9"],
  };
}

/** A gradient background from a preset id. */
export function gradientFrom(id: string, angle: number): GradientBackground {
  return presetBackground(id, angle);
}

/** A solid background from a preset id. */
export function solidFrom(id: string): Background {
  const preset = solids.find((candidate) => candidate.id === id) ?? solids[0];
  return {
    kind: "solid",
    preset: preset?.id ?? null,
    color: preset?.hex ?? "#e4e4e7",
  };
}

/** Whether the card section differs from its defaults. */
export function cardChanged(card: Card): boolean {
  return (
    card.edge !== CARD_DEFAULTS.edge ||
    card.scale !== CARD_DEFAULTS.scale ||
    card.roundness !== CARD_DEFAULTS.roundness ||
    card.padding !== CARD_DEFAULTS.padding ||
    card.shadow !== CARD_DEFAULTS.shadow
  );
}

/** Whether the position section differs from its defaults. */
export function positionChanged(card: Card): boolean {
  return (
    card.rotation !== POSITION_DEFAULTS.rotation ||
    card.tilt.x !== 0 ||
    card.tilt.y !== 0 ||
    card.anchor !== POSITION_DEFAULTS.anchor
  );
}

/** Whether the background differs from its default. */
export function backgroundChanged(card: Card): boolean {
  const background = card.background;
  return (
    background.kind !== "gradient" ||
    background.preset !== "lilac" ||
    background.angle !== 135
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
  | { readonly type: "redo" };

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
 * as a drag's commit or a discrete pick does, so a whole drag undoes at once.
 */
export function studioReducer(studio: Studio, action: StudioAction): Studio {
  switch (action.type) {
    case "change": {
      const base = studio.card ?? newCard();
      const next = action.change(base);
      const joining = studio.card !== null && studio.open === action.key;
      return {
        card: next,
        past: joining
          ? studio.past
          : [...studio.past, studio.card].slice(-HISTORY),
        future: [],
        open: action.key,
      };
    }
    case "seal":
      return studio.open === null ? studio : { ...studio, open: null };
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
    default: {
      const unknown: never = action;
      return unknown;
    }
  }
}
