import { describe, expect, it } from "vitest";
import { SAMPLE_EDITOR } from "./state.ts";
import { isSavedKey, parseEditor } from "./storage.ts";

describe("isSavedKey", () => {
  it("finds the editor's keys and leaves the other demos' alone", () => {
    expect(isSavedKey("buttery:onboarding:deckhand")).toBe(true);
    expect(isSavedKey("deckhand:deck")).toBe(true);
    expect(isSavedKey("buttery:onboarding:halfmoon-shop")).toBe(false);
    expect(isSavedKey("buttery:nudge:roastery-delivery-questions")).toBe(false);
  });
});

describe("parseEditor", () => {
  it("reads back a saved deck and the slide picked in it", () => {
    const saved = { ...SAMPLE_EDITOR, selected: "quote" };
    expect(parseEditor(JSON.stringify(saved))).toEqual(saved);
  });

  it("picks the first slide when the saved pick isn't in the deck", () => {
    const saved = { ...SAMPLE_EDITOR, selected: "gone" };
    expect(parseEditor(JSON.stringify(saved))?.selected).toBe(
      SAMPLE_EDITOR.deck.slides[0]?.id,
    );
  });

  it("ignores what isn't a saved editor", () => {
    expect(parseEditor(null)).toBeNull();
    expect(parseEditor("{not json")).toBeNull();
    expect(parseEditor(JSON.stringify({ deck: { name: "Deck" } }))).toBeNull();
    expect(parseEditor(JSON.stringify(["deck"]))).toBeNull();
  });
});
