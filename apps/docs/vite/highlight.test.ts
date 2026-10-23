import { describe, expect, it, vi } from "vitest";

describe("sharedHighlighter", () => {
  it("keeps one highlighter when this module loads again, as it does each time the dev server reloads its config", async () => {
    const first = (await import("./highlight.ts")).sharedHighlighter();
    vi.resetModules();
    const second = (await import("./highlight.ts")).sharedHighlighter();
    expect(second).toBe(first);
    await first;
  });
});
