import { describe, expect, it } from "vitest";
import { clearSavedState, isSavedKey } from "./storage.ts";

/** A `Storage` held in memory, as `localStorage` is in a browser. */
function memoryStorage(entries: Readonly<Record<string, string>>): Storage {
  const items = new Map(Object.entries(entries));
  return {
    get length() {
      return items.size;
    },
    key: (index) => [...items.keys()][index] ?? null,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
    clear: () => {
      items.clear();
    },
  };
}

describe("isSavedKey", () => {
  it("finds the demo's own keys and its components' under its prefix", () => {
    for (const key of [
      "roastery:pickup",
      "buttery:sidebar:roastery",
      "buttery:command-search-recent:roastery",
      "buttery:announcement:roastery-roast-planning",
      "buttery:setup-guide-open:roastery-setup",
    ])
      expect(isSavedKey(key), key).toBe(true);
  });

  it("leaves other apps' keys alone, even when they start alike", () => {
    for (const key of [
      "buttery:onboarding:card-studio",
      "buttery:sidebar:roasteryish",
      "roasting:pickup",
      "buttery-docs:demo-pill",
    ])
      expect(isSavedKey(key), key).toBe(false);
  });
});

describe("clearSavedState", () => {
  it("removes every key the demo saved and nothing else", () => {
    const storage = memoryStorage({
      "roastery:invites": '["june@example.com"]',
      "buttery:nudge:roastery-delivery-questions": "true",
      "buttery:onboarding:card-studio": "done",
    });
    clearSavedState(storage);
    expect(storage.length).toBe(1);
    expect(storage.getItem("buttery:onboarding:card-studio")).toBe("done");
  });
});
