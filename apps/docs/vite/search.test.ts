import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  buildSearchIndexes,
  groupsByBest,
  searchDocs,
} from "../src/search/search.ts";
import { searchGolden } from "../tests/search-golden.ts";
import { searchDocsIn } from "./search.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const docs = searchDocsIn(root);
const indexes = buildSearchIndexes(docs);

describe("docs search", () => {
  it("puts a component's result in the group of its page's section", () => {
    const groupOf = (name: string): string | undefined =>
      docs.find((doc) => doc.id === `component:${name}`)?.group;
    expect(
      ["Button", "FitBox", "Stack", "Text", "Presence", "PageHeader"].map(
        groupOf,
      ),
    ).toEqual([
      "Components",
      "Layout",
      "Layout",
      "Foundations",
      "Motion",
      "Patterns",
    ]);
  });

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

  it.each(searchGolden.filter(({ first }) => first === true))(
    "makes what $query should find the search panel's first row, before and after the full text loads",
    ({ query, expect: wanted }) => {
      for (const searched of [
        { titles: indexes.titles, text: null },
        indexes,
      ]) {
        const hits = searchDocs(searched, query, 500);
        const [group] = groupsByBest(hits);
        const row = hits.find((hit) => hit.entry.group === group);
        expect(
          wanted.some((start) => row?.entry.href.startsWith(start) === true),
          `"${query}" opened the panel with ${row?.entry.href ?? "nothing"}${searched.text === null ? " before the full text loaded" : ""}`,
        ).toBe(true);
      }
    },
  );

  it("ranks a page or component whose title is the query first, before and after the full text loads", () => {
    const titled = docs.filter(
      (doc) => doc.kind === "page" || doc.kind === "component",
    );
    for (const searched of [{ titles: indexes.titles, text: null }, indexes]) {
      const misses = titled.flatMap((doc) => {
        const [top] = searchDocs(searched, doc.title, 1);
        return top?.entry.title === doc.title &&
          (top.entry.kind === "page" || top.entry.kind === "component")
          ? []
          : [`"${doc.title}" gave ${top?.entry.id ?? "nothing"}`];
      });
      expect(misses).toEqual([]);
    }
  });

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
