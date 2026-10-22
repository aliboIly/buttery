import { describe, expect, it } from "vitest";
import { isSavedKey } from "./storage.ts";

describe("isSavedKey", () => {
  it("finds the editor's keys and leaves the other demos' alone", () => {
    expect(isSavedKey("buttery:onboarding:deckhand")).toBe(true);
    expect(isSavedKey("deckhand:deck")).toBe(true);
    expect(isSavedKey("buttery:onboarding:halfmoon-shop")).toBe(false);
    expect(isSavedKey("buttery:nudge:roastery-delivery-questions")).toBe(false);
  });
});
