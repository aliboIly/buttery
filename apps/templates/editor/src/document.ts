/** The canvas shapes the editor offers. */
export type Shape = "wide" | "square" | "tall";

/** What the editor makes: a title on a card, on a backdrop. */
export interface Design {
  readonly title: string;
  /** The id of a gradient preset from `@butteryui/core/palettes`. */
  readonly backdrop: string;
  readonly shape: Shape;
  /** The card's corner radius, in px of the full-size canvas. */
  readonly corners: number;
}

/** Each shape's canvas size in px, as an export would draw it. */
export const SHAPE_SIZES: Readonly<
  Record<Shape, { readonly width: number; readonly height: number }>
> = {
  wide: { width: 1920, height: 1080 },
  square: { width: 1440, height: 1440 },
  tall: { width: 1080, height: 1920 },
};

/** A new design. */
export const NEW_DESIGN: Design = {
  title: "Opening night",
  backdrop: "lilac",
  shape: "wide",
  corners: 24,
};

/** The design and its undo history. */
export interface History {
  readonly design: Design;
  readonly past: readonly Design[];
  readonly future: readonly Design[];
  /** What the open undo step is changing, so typing or a drag is one step; `null` once sealed. */
  readonly open: string | null;
}

/** A change to the history. */
export type HistoryAction =
  | { readonly type: "change"; readonly key: string; readonly design: Design }
  | { readonly type: "seal" }
  | { readonly type: "undo" }
  | { readonly type: "redo" };

/** The history as the editor opens: a new design and nothing to undo. */
export const START: History = {
  design: NEW_DESIGN,
  past: [],
  future: [],
  open: null,
};

const STEPS = 100;

/**
 * Applies a change, keeping up to 100 undo steps. Changes with the same key join one step until it's
 * sealed, so a whole drag or a typed word undoes at once.
 */
export function historyReducer(
  history: History,
  action: HistoryAction,
): History {
  switch (action.type) {
    case "change": {
      const joining = history.open === action.key;
      return {
        design: action.design,
        past: joining
          ? history.past
          : [...history.past, history.design].slice(-STEPS),
        future: [],
        open: action.key,
      };
    }
    case "seal":
      return history.open === null ? history : { ...history, open: null };
    case "undo": {
      const previous = history.past.at(-1);
      if (previous === undefined) return history;
      return {
        design: previous,
        past: history.past.slice(0, -1),
        future: [history.design, ...history.future],
        open: null,
      };
    }
    case "redo": {
      const [next, ...rest] = history.future;
      if (next === undefined) return history;
      return {
        design: next,
        past: [...history.past, history.design],
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
