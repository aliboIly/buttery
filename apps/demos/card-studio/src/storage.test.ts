import { describe, expect, it } from "vitest";
import { isSavedKey } from "./storage.ts";

describe("isSavedKey", () => {
  it("finds the tour's key and leaves the launch site's and the roastery's alone", () => {
    expect(isSavedKey("buttery:onboarding:card-studio")).toBe(true);
    expect(isSavedKey("buttery:sidebar:studio-site")).toBe(false);
    expect(isSavedKey("buttery:nudge:roastery-delivery-questions")).toBe(false);
  });
});
