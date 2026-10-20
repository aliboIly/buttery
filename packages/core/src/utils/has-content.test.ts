import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { hasContent } from "./has-content.ts";

describe("hasContent", () => {
  it("finds nothing in what React renders as nothing", () => {
    for (const node of [
      undefined,
      null,
      false,
      true,
      "",
      [],
      [null, false, ""],
    ]) {
      expect(hasContent(node), String(node)).toBe(false);
    }
  });

  it("finds text, numbers, elements and lists holding any of them", () => {
    expect(hasContent("Saved")).toBe(true);
    expect(hasContent(0)).toBe(true);
    expect(hasContent(createElement("b"))).toBe(true);
    expect(hasContent([null, "Saved"])).toBe(true);
  });
});
