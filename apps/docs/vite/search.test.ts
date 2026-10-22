import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildSearchIndexes, searchDocs } from "../src/search/search.ts";
import { searchGolden } from "../tests/search-golden.ts";
import { searchDocsIn } from "./search.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const indexes = buildSearchIndexes(searchDocsIn(root));

describe("docs search", () => {
  // 120 KB gzipped is about 100ms on a 10 Mbit/s connection, leaving room for a round trip and parsing.
  it("keeps the titles index small enough to load in under 200ms", () => {
    const size = gzipSync(JSON.stringify(indexes.titles)).length;
    expect(size).toBeLessThan(120_000);
  });

  it("keeps at least 40 golden queries", () => {
    expect(searchGolden.length).toBeGreaterThanOrEqual(40);
  });

  it.each(searchGolden)(
    "finds what $query should in the top three",
    ({ query, expect: wanted }) => {
      const top = searchDocs(indexes, query)
        .slice(0, 3)
        .map((hit) => hit.entry.href);
      expect(
        top.some((href) => wanted.some((start) => href.startsWith(start))),
        `"${query}" gave ${top.join(", ")}; wanted one starting with ${wanted.join(" or ")}`,
      ).toBe(true);
    },
  );

  it("finds titles before the full text has loaded", () => {
    const top = searchDocs({ titles: indexes.titles, text: null }, "Dialog")
      .slice(0, 1)
      .map((hit) => hit.entry.href);
    expect(top).toEqual(["/components/dialog"]);
  });

  it("finds a word that's only in a page's text once the full text has loaded", () => {
    const query = "illustrations";
    expect(searchDocs({ titles: indexes.titles, text: null }, query)).toEqual(
      [],
    );
    expect(searchDocs(indexes, query).length).toBeGreaterThan(0);
  });
});
