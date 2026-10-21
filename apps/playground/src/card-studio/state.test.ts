import { describe, expect, it } from "vitest";
import { STUDIO_START, newCard, studioReducer } from "./state.ts";
import type { Card, Studio, StudioAction } from "./state.ts";

function run(
  actions: readonly StudioAction[],
  from: Studio = STUDIO_START,
): Studio {
  return actions.reduce(studioReducer, from);
}

function scaleTo(scale: number): StudioAction {
  return {
    type: "change",
    key: "scale",
    change: (card: Card) => ({ ...card, scale }),
  };
}

describe("studioReducer", () => {
  it("joins changes to the same thing into one step until it's sealed", () => {
    const dragged = run([scaleTo(70), scaleTo(60), scaleTo(50)]);
    expect(dragged.card?.scale).toBe(50);
    expect(dragged.past).toHaveLength(1);
    expect(dragged.past[0]?.scale).toBe(newCard().scale);

    const twice = run([{ type: "seal" }, scaleTo(40)], dragged);
    expect(twice.past).toHaveLength(2);
    expect(twice.past[1]?.scale).toBe(50);
  });

  it("starts a new step when something else changes", () => {
    const studio = run([
      scaleTo(70),
      {
        type: "change",
        key: "turn",
        change: (card) => ({ ...card, turn: 15 }),
      },
    ]);
    expect(studio.past).toHaveLength(2);
    expect(studio.open).toBe("turn");
  });

  it("undoes and redoes whole steps, and a new change drops what was undone", () => {
    const changed = run([scaleTo(70), { type: "seal" }, scaleTo(60)]);
    const undone = run([{ type: "undo" }], changed);
    expect(undone.card?.scale).toBe(70);
    expect(undone.future).toHaveLength(1);
    expect(run([{ type: "redo" }], undone).card?.scale).toBe(60);
    const branched = run([scaleTo(30)], undone);
    expect(branched.future).toHaveLength(0);
    expect(run([{ type: "redo" }], branched)).toBe(branched);
  });

  it("does nothing on undo or redo with no history", () => {
    expect(run([{ type: "undo" }])).toBe(STUDIO_START);
    expect(run([{ type: "redo" }])).toBe(STUDIO_START);
  });

  it("removes the card in one step that undo brings back, and a change afterwards starts a new card", () => {
    const removed = run([{ type: "set", card: null }]);
    expect(removed.card).toBeNull();
    expect(run([{ type: "undo" }], removed).card).toEqual(newCard());
    const restarted = run([scaleTo(50)], removed);
    expect(restarted.card?.scale).toBe(50);
    expect(restarted.past.at(-1)).toBeNull();
  });

  it("restores a deleted card from its toast only while there's no card", () => {
    const removed = run([{ type: "set", card: null }]);
    const restored = run([{ type: "restore" }], removed);
    expect(restored.card).toEqual(newCard());
    expect(run([{ type: "restore" }], restored)).toBe(restored);
    const undone = run([{ type: "undo" }], removed);
    expect(run([{ type: "restore" }], undone)).toBe(undone);
  });

  it("drops the open step it names as if it never happened, leaving others alone", () => {
    const resized = run([
      scaleTo(60),
      { type: "seal" },
      {
        type: "change",
        key: "resize",
        change: (card) => ({ ...card, width: 1200 }),
      },
      {
        type: "change",
        key: "resize",
        change: (card) => ({ ...card, width: 1000 }),
      },
    ]);
    const dropped = run([{ type: "drop", key: "resize" }], resized);
    expect(dropped.card?.width).toBe(newCard().width);
    expect(dropped.card?.scale).toBe(60);
    expect(dropped.past).toHaveLength(1);
    expect(dropped.future).toHaveLength(0);
    expect(run([{ type: "drop", key: "title" }], resized)).toBe(resized);
  });

  it("doesn't count a change that changes nothing as a step", () => {
    const same = run([scaleTo(newCard().scale)]);
    expect(same).toBe(STUDIO_START);
  });

  it("drops a step that ends where it began once it's sealed, as a drag brought back does", () => {
    const wandered = run([scaleTo(50), scaleTo(newCard().scale)]);
    expect(wandered.past).toHaveLength(1);
    const sealed = run([{ type: "seal" }], wandered);
    expect(sealed.past).toHaveLength(0);
    expect(sealed.open).toBeNull();
  });

  it("keeps the last 100 steps", () => {
    const actions = Array.from({ length: 120 }, (_, index) => [
      scaleTo(20 + (index % 80)),
      { type: "seal" } as const,
    ]).flat();
    expect(run(actions).past).toHaveLength(100);
  });
});
