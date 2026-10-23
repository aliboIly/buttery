import { describe, expect, it } from "vitest";
import { isSavedKey } from "./storage.ts";

describe("isSavedKey", () => {
  it("finds the shop's keys and leaves the roastery's and the editor's alone", () => {
    expect(isSavedKey("halfmoon-shop:bag")).toBe(true);
    expect(isSavedKey("buttery:announcement:halfmoon-shop")).toBe(true);
    expect(isSavedKey("buttery:nudge:roastery-delivery-questions")).toBe(false);
    expect(isSavedKey("buttery:onboarding:deckhand")).toBe(false);
  });
});
