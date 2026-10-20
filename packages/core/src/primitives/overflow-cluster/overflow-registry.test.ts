import { describe, expect, it } from "vitest";
import { entriesToHide } from "./overflow-registry.ts";

const entries = [
  { id: "undo", priority: 3 },
  { id: "redo", priority: 3 },
  { id: "share", priority: 1 },
  { id: "help", priority: 0 },
  { id: "export", priority: 2 },
];
const widths = new Map(entries.map((entry) => [entry.id, 60]));

describe("entriesToHide", () => {
  it("hides nothing when everything fits", () => {
    expect(entriesToHide(entries, widths, 316, 4, 36)).toEqual(new Set());
  });

  it("hides the lowest priority first and leaves room for the More button", () => {
    expect(entriesToHide(entries, widths, 300, 4, 36)).toEqual(
      new Set(["help"]),
    );
    expect(entriesToHide(entries, widths, 250, 4, 36)).toEqual(
      new Set(["help", "share"]),
    );
  });

  it("hides later items first among equal priorities", () => {
    expect(entriesToHide(entries, widths, 140, 4, 36)).toEqual(
      new Set(["help", "share", "export", "redo"]),
    );
  });

  it("can hide everything, leaving only the More button", () => {
    expect(entriesToHide(entries, widths, 40, 4, 36).size).toBe(5);
  });
});
