import { describe, expect, it } from "vitest";
import { spacingAttributes } from "./spacing.ts";

describe("spacingAttributes", () => {
  it("writes only the props that are set, as step keys", () => {
    expect(spacingAttributes({ gap: 4, padX: "0.5" })).toEqual({
      "data-gap": "4",
      "data-pad-x": "0.5",
    });
    expect(spacingAttributes({ pad: 1.5 })).toEqual({ "data-pad": "1.5" });
    expect(spacingAttributes({})).toEqual({});
  });
});
