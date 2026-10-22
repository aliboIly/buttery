import { LOOK_DEFAULTS, SAMPLE_DECK, newSlide, nextSlideId } from "./deck.ts";
import type { Deck, Layout, Slide } from "./deck.ts";

/** What the editor shows: the deck and the slide picked in it. */
export interface Editor {
  readonly deck: Deck;
  /** The picked slide's id, or `null` once the deck has no slides. */
  readonly selected: string | null;
}

/** The editor and its undo history. */
export interface History {
  readonly present: Editor;
  readonly past: readonly Editor[];
  readonly future: readonly Editor[];
  /** What the open step is changing, so typing or a drag is one step; `null` once it's sealed. */
  readonly open: string | null;
}

/** A change to the editor. */
export type HistoryAction =
  | {
      readonly type: "change";
      readonly key: string;
      readonly change: (deck: Deck) => Deck;
    }
  | { readonly type: "seal" }
  | { readonly type: "select"; readonly id: string }
  /** Adds a slide of `layout` after the picked one, continuing its look. */
  | { readonly type: "add"; readonly layout: Layout }
  | { readonly type: "duplicate"; readonly id: string }
  | { readonly type: "remove"; readonly id: string }
  /** Puts a deleted slide back where it was, as its toast's Undo does, unless it's already back. */
  | {
      readonly type: "restore";
      readonly slide: Slide;
      readonly index: number;
    }
  /** Moves a slide to `to`; moves with the same `key`, as a drag makes, join one step until it's sealed. */
  | {
      readonly type: "move";
      readonly id: string;
      readonly to: number;
      readonly key: string;
    }
  | { readonly type: "undo" }
  | { readonly type: "redo" };

const STEPS = 100;

/** The history as the editor opens on `editor`: nothing to undo. */
export function startHistory(editor: Editor): History {
  return { present: editor, past: [], future: [], open: null };
}

/** The sample deck with its first slide picked. */
export const SAMPLE_EDITOR: Editor = {
  deck: SAMPLE_DECK,
  selected: SAMPLE_DECK.slides[0]?.id ?? null,
};

/** Whether two decks are the same, so a change between them isn't worth an undo step. */
export function sameDeck(a: Deck, b: Deck): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/** The deck with one slide changed. */
export function changeSlide(
  deck: Deck,
  id: string,
  change: (slide: Slide) => Slide,
): Deck {
  return {
    ...deck,
    slides: deck.slides.map((slide) =>
      slide.id === id ? change(slide) : slide,
    ),
  };
}

function inserted(
  slides: readonly Slide[],
  index: number,
  slide: Slide,
): readonly Slide[] {
  const at = Math.min(Math.max(index, 0), slides.length);
  return [...slides.slice(0, at), slide, ...slides.slice(at)];
}

/** A finished step: what was there goes into the past, and nothing is left to redo. */
function commit(history: History, present: Editor): History {
  return {
    present,
    past: [...history.past, history.present].slice(-STEPS),
    future: [],
    open: null,
  };
}

function sealed(history: History): History {
  if (history.open === null) return history;
  const before = history.past.at(-1);
  return before !== undefined && sameDeck(before.deck, history.present.deck)
    ? { ...history, past: history.past.slice(0, -1), open: null }
    : { ...history, open: null };
}

/**
 * Applies a change, keeping up to 100 undo steps. Changes with the same key join one step until it's
 * sealed, so a typed title or a whole drag undoes at once; a change that changes nothing isn't a step, and
 * a step that ends where it began is dropped when it's sealed. Picking a slide isn't a step, but each step
 * remembers which slide was picked, so undoing it shows that slide again.
 */
export function historyReducer(
  history: History,
  action: HistoryAction,
): History {
  const { deck, selected } = history.present;
  switch (action.type) {
    case "change": {
      const next = action.change(deck);
      const joining = history.open === action.key;
      if (!joining && sameDeck(next, deck)) return history;
      return {
        present: { ...history.present, deck: next },
        past: joining
          ? history.past
          : [...history.past, history.present].slice(-STEPS),
        future: [],
        open: action.key,
      };
    }
    case "seal":
      return sealed(history);
    case "select": {
      if (
        action.id === selected ||
        !deck.slides.some((slide) => slide.id === action.id)
      )
        return history;
      const done = sealed(history);
      return { ...done, present: { ...done.present, selected: action.id } };
    }
    case "add": {
      const index = deck.slides.findIndex((slide) => slide.id === selected);
      const look = deck.slides[index] ?? deck.slides.at(-1) ?? LOOK_DEFAULTS;
      const slide = newSlide(nextSlideId(deck), action.layout, look);
      const at = index === -1 ? deck.slides.length : index + 1;
      return commit(sealed(history), {
        deck: { ...deck, slides: inserted(deck.slides, at, slide) },
        selected: slide.id,
      });
    }
    case "duplicate": {
      const index = deck.slides.findIndex((slide) => slide.id === action.id);
      const original = deck.slides[index];
      if (!original) return history;
      const copy = { ...original, id: nextSlideId(deck) };
      return commit(sealed(history), {
        deck: { ...deck, slides: inserted(deck.slides, index + 1, copy) },
        selected: copy.id,
      });
    }
    case "remove": {
      const index = deck.slides.findIndex((slide) => slide.id === action.id);
      if (index === -1) return history;
      const slides = deck.slides.filter((slide) => slide.id !== action.id);
      const next =
        selected === action.id
          ? (slides[index]?.id ?? slides[index - 1]?.id ?? null)
          : selected;
      return commit(sealed(history), {
        deck: { ...deck, slides },
        selected: next,
      });
    }
    case "restore": {
      if (deck.slides.some((slide) => slide.id === action.slide.id))
        return history;
      return commit(sealed(history), {
        deck: {
          ...deck,
          slides: inserted(deck.slides, action.index, action.slide),
        },
        selected: action.slide.id,
      });
    }
    case "move": {
      const from = deck.slides.findIndex((slide) => slide.id === action.id);
      const slide = deck.slides[from];
      const to = Math.min(Math.max(action.to, 0), deck.slides.length - 1);
      if (!slide || from === to) return history;
      const rest = deck.slides.filter((other) => other.id !== action.id);
      const joining = history.open === action.key;
      return {
        present: {
          ...history.present,
          deck: { ...deck, slides: inserted(rest, to, slide) },
        },
        past: joining
          ? history.past
          : [...history.past, history.present].slice(-STEPS),
        future: [],
        open: action.key,
      };
    }
    case "undo": {
      const previous = history.past.at(-1);
      if (previous === undefined) return history;
      return {
        present: previous,
        past: history.past.slice(0, -1),
        future: [history.present, ...history.future],
        open: null,
      };
    }
    case "redo": {
      const [next, ...rest] = history.future;
      if (next === undefined) return history;
      return {
        present: next,
        past: [...history.past, history.present],
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
