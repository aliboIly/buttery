import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { variants } from "./variants.ts";
import type { VariantProps } from "./variants.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

const badge = variants(
  "my-badge",
  { tone: ["neutral", "success", "danger"], iconSide: ["start", "end"] },
  { tone: "neutral", iconSide: "start" },
);

describe("variants", () => {
  it("gives the base class and a data attribute per variant, falling back to the defaults", () => {
    expect(badge()).toEqual({
      className: "my-badge",
      "data-tone": "neutral",
      "data-icon-side": "start",
    });
    expect(badge({ tone: "danger" }, "custom")).toEqual({
      className: "my-badge custom",
      "data-tone": "danger",
      "data-icon-side": "start",
    });
  });

  it("types each variant's props from its values", () => {
    expectTypeOf<VariantProps<typeof badge>>().toEqualTypeOf<{
      readonly tone?: "neutral" | "success" | "danger" | undefined;
      readonly iconSide?: "start" | "end" | undefined;
    }>();
    expect(badge.schema.tone).toEqual(["neutral", "success", "danger"]);
    expect(badge.defaults).toEqual({ tone: "neutral", iconSide: "start" });
  });

  it("warns, with the fix, about a value outside its variant", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const loose = badge as (values: Record<string, string>) => unknown;
    loose({ tone: "loud" });
    expect(warn).toHaveBeenCalledWith(
      '[buttery:variants] "loud" isn\'t a tone of my-badge. Fix: use one of "neutral", "success", "danger".',
    );
  });
});
