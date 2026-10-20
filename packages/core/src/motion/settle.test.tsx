import { describe, expect, it } from "vitest";
import { isSettled, publishSettled, trackAnimation } from "./settle.ts";

const root = document.documentElement;

describe("settled flag", () => {
  it("drops data-bt-settled while any animation runs", () => {
    publishSettled();
    expect(root.hasAttribute("data-bt-settled")).toBe(true);
    const finishA = trackAnimation();
    const finishB = trackAnimation();
    expect(root.hasAttribute("data-bt-settled")).toBe(false);
    finishA();
    finishA();
    expect(isSettled()).toBe(false);
    finishB();
    expect(isSettled()).toBe(true);
    expect(root.hasAttribute("data-bt-settled")).toBe(true);
  });
});
