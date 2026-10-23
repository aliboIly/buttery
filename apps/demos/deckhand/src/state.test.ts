import { describe, expect, it } from "vitest";
import { SAMPLE_DECK } from "./deck.ts";
import type { Deck, Slide } from "./deck.ts";
import {
  SAMPLE_EDITOR,
  changeSlide,
  historyReducer,
  startHistory,
} from "./state.ts";
import type { History, HistoryAction } from "./state.ts";

const START = startHistory(SAMPLE_EDITOR);

function run(
  actions: readonly HistoryAction[],
  from: History = START,
): History {
  return actions.reduce(historyReducer, from);
}

function titleOf(id: string, title: string): HistoryAction {
  return {
    type: "change",
    key: `text:${id}:title`,
    change: (deck: Deck) =>
      changeSlide(deck, id, (slide: Slide) => ({ ...slide, title })),
  };
}

function sizeOf(id: string, size: number): HistoryAction {
  return {
    type: "change",
    key: `size:${id}`,
    change: (deck: Deck) =>
      changeSlide(deck, id, (slide: Slide) => ({ ...slide, size })),
  };
}

function ids(history: History): readonly string[] {
  return history.present.deck.slides.map((slide) => slide.id);
}

function slide(history: History, id: string): Slide | undefined {
  return history.present.deck.slides.find((candidate) => candidate.id === id);
}

describe("historyReducer", () => {
  it("joins changes with the same key into one step until it's sealed", () => {
    const typed = run([
      titleOf("cover", "H"),
      titleOf("cover", "Ha"),
      titleOf("cover", "Hal"),
    ]);
    expect(slide(typed, "cover")?.title).toBe("Hal");
    expect(typed.past).toHaveLength(1);
    expect(typed.past[0]?.deck).toBe(SAMPLE_DECK);

    const again = run([{ type: "seal" }, titleOf("cover", "Halo")], typed);
    expect(again.past).toHaveLength(2);
  });

  it("starts a new step when something else changes", () => {
    const history = run([titleOf("cover", "Hello"), sizeOf("cover", 120)]);
    expect(history.past).toHaveLength(2);
    expect(history.open).toBe("size:cover");
  });

  it("undoes and redoes whole steps, and a new change drops what was undone", () => {
    const changed = run([
      sizeOf("cover", 110),
      { type: "seal" },
      sizeOf("cover", 120),
    ]);
    const undone = run([{ type: "undo" }], changed);
    expect(slide(undone, "cover")?.size).toBe(110);
    expect(undone.future).toHaveLength(1);
    expect(slide(run([{ type: "redo" }], undone), "cover")?.size).toBe(120);
    const branched = run([sizeOf("cover", 80)], undone);
    expect(branched.future).toHaveLength(0);
    expect(run([{ type: "redo" }], branched)).toBe(branched);
  });

  it("does nothing on undo or redo with no history", () => {
    expect(run([{ type: "undo" }])).toBe(START);
    expect(run([{ type: "redo" }])).toBe(START);
  });

  it("picks a slide without a step, and undoing a change shows the slide it changed", () => {
    const picked = run([{ type: "select", id: "quote" }]);
    expect(picked.present.selected).toBe("quote");
    expect(picked.past).toHaveLength(0);
    const changed = run(
      [
        titleOf("quote", "Fresh every week."),
        { type: "seal" },
        { type: "select", id: "numbers" },
        { type: "undo" },
      ],
      picked,
    );
    expect(changed.present.selected).toBe("quote");
    expect(slide(changed, "quote")?.title).toBe(slide(START, "quote")?.title);
  });

  it("ignores picking a slide the deck doesn't have", () => {
    expect(run([{ type: "select", id: "nowhere" }])).toBe(START);
  });

  it("adds a slide after the picked one, in its look, and picks it", () => {
    const added = run([
      { type: "select", id: "quote" },
      { type: "add", layout: "points" },
    ]);
    const id = added.present.selected ?? "";
    expect(ids(added).indexOf(id)).toBe(ids(START).indexOf("quote") + 1);
    const fresh = slide(added, id);
    expect(fresh?.layout).toBe("points");
    expect(fresh?.fill).toEqual(slide(START, "quote")?.fill);
    expect(fresh?.box).toBe(slide(START, "quote")?.box);
    expect(fresh?.points).not.toBe("");
  });

  it("duplicates a slide right after it under a new id", () => {
    const copied = run([{ type: "duplicate", id: "numbers" }]);
    const at = ids(copied).indexOf("numbers");
    const copy = copied.present.deck.slides[at + 1];
    expect(copy?.id).not.toBe("numbers");
    expect(copy?.id).toBe(copied.present.selected);
    expect({ ...copy, id: "numbers" }).toEqual(slide(START, "numbers"));
  });

  it("deletes a slide, picking the one after it, or the one before at the end", () => {
    const middle = run([
      { type: "select", id: "numbers" },
      { type: "remove", id: "numbers" },
    ]);
    expect(ids(middle)).not.toContain("numbers");
    expect(middle.present.selected).toBe("coffees");
    const last = run([
      { type: "select", id: "next" },
      { type: "remove", id: "next" },
    ]);
    expect(last.present.selected).toBe("quote");
    expect(slide(run([{ type: "undo" }], last), "next")).toBeDefined();
  });

  it("empties the deck one slide at a time, picking nothing once it's empty", () => {
    const empty = run(
      ids(START).map((id): HistoryAction => ({ type: "remove", id })),
    );
    expect(empty.present.deck.slides).toHaveLength(0);
    expect(empty.present.selected).toBeNull();
    const back = run([{ type: "add", layout: "title" }], empty);
    expect(back.present.deck.slides).toHaveLength(1);
    expect(back.present.selected).toBe(back.present.deck.slides[0]?.id);
  });

  it("puts a deleted slide back where it was from its toast, only while it's gone", () => {
    const removed = run([{ type: "remove", id: "coffees" }]);
    const original = slide(START, "coffees");
    if (!original) throw new Error("The sample deck has no coffees slide.");
    const restored = run(
      [{ type: "restore", slide: original, index: 3 }],
      removed,
    );
    expect(ids(restored)).toEqual(ids(START));
    expect(restored.present.selected).toBe("coffees");
    expect(
      run([{ type: "restore", slide: original, index: 3 }], restored),
    ).toBe(restored);
  });

  it("moves a slide, joining a drag's moves into one step", () => {
    const dragged = run([
      { type: "move", id: "cover", to: 1, key: "drag" },
      { type: "move", id: "cover", to: 2, key: "drag" },
      { type: "move", id: "cover", to: 3, key: "drag" },
    ]);
    expect(ids(dragged).indexOf("cover")).toBe(3);
    expect(dragged.past).toHaveLength(1);
    const back = run([{ type: "seal" }, { type: "undo" }], dragged);
    expect(ids(back)).toEqual(ids(START));
  });

  it("keeps a moved slide inside the deck and ignores a move to where it is", () => {
    const end = run([{ type: "move", id: "cover", to: 99, key: "move" }]);
    expect(ids(end).at(-1)).toBe("cover");
    expect(run([{ type: "move", id: "cover", to: 0, key: "move" }])).toBe(
      START,
    );
  });

  it("doesn't count a change that changes nothing as a step", () => {
    const same = run([sizeOf("cover", 100)]);
    expect(same).toBe(START);
  });

  it("drops a step that ends where it began once it's sealed, as a drag brought back does", () => {
    const wandered = run([sizeOf("cover", 120), sizeOf("cover", 100)]);
    expect(wandered.past).toHaveLength(1);
    const sealed = run([{ type: "seal" }], wandered);
    expect(sealed.past).toHaveLength(0);
    expect(sealed.open).toBeNull();
  });

  it("keeps the last 100 steps", () => {
    const actions = Array.from({ length: 120 }, (_, index) => [
      sizeOf("cover", 70 + (index % 60)),
      { type: "seal" } as const,
    ]).flat();
    expect(run(actions).past).toHaveLength(100);
  });
});
