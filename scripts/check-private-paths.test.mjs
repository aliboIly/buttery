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

  it("leaves other words alone: another case, longer words, none to look for", () => {
    expect(findNames("acme Acmeville MegaAcme", ["Acme"])).toEqual([]);
    expect(findNames("Acme", [])).toEqual([]);
  });

  it("matches names with dots or spaces literally", () => {
    expect(findNames("see acme.io or acmexio", ["acme.io"])).toEqual([
      { line: 1, name: "acme.io" },
    ]);
  });
});
