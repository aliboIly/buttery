import { describe, expect, it } from "vitest";
import { findNames, parseNames } from "./check-private-paths.mjs";

describe("parseNames", () => {
  it("reads one name a line, skipping blank lines and comments", () => {
    expect(parseNames("# products\nAcme\n\nGlobex  # the dashboard\n")).toEqual(
      ["Acme", "Globex"],
    );
  });
});

describe("findNames", () => {
  it("finds a name as a whole word, as written or plural, with its line", () => {
    const text = "const tone = 1;\nfunction Acmes() {}\n// Like Acme's menu\n";
    expect(findNames(text, ["Acme"])).toEqual([
      { line: 2, name: "Acmes" },
      { line: 3, name: "Acme" },
    ]);
  });

  it("finds a name in any case and inside camelCase, kebab, snake and dotted compounds", () => {
    const text =
      "acme\nacmeCard\nMegaAcme\ninspiration-acme\nACME_LIKE\nacme.css";
    expect(findNames(text, ["Acme"]).map(({ line }) => line)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("leaves longer words alone, and finds nothing with no names to look for", () => {
    expect(findNames("Acmeville acmestore", ["Acme"])).toEqual([]);
    expect(findNames("Acme", [])).toEqual([]);
  });

  it("matches names with dots or spaces as that phrase, in any case", () => {
    expect(findNames("see Acme.io or acmexio", ["acme.io"])).toEqual([
      { line: 1, name: "Acme.io" },
    ]);
  });
});
