import MiniSearch from "minisearch";
import type { Options, Query } from "minisearch";
import { searchSynonyms } from "./synonyms.ts";

/** What a search result is, which sets the group it shows under and how it ranks. */
export type SearchKind =
  "page" | "component" | "heading" | "prop" | "token" | "example";

/** One thing the docs search can find. */
export interface SearchDoc {
  readonly id: string;
  readonly kind: SearchKind;
  /** The group its result shows under, such as `"Components"` or `"Tokens"`. */
  readonly group: string;
  readonly title: string;
  /** Where it sits on the site, such as `["Components", "Actions"]`. */
  readonly path: readonly string[];
  /** The page, and heading, it opens, such as `/components/button#props`. */
  readonly href: string;
  /** Other words it's found by, such as the component a prop belongs to. */
  readonly keywords: string;
  /** Its text, searched once the full text has loaded, and the source of a result's snippet. */
  readonly text: string;
}

/** What a result shows: the document's place on the site, without its text. */
export type SearchEntry = Omit<SearchDoc, "keywords" | "text">;

/** One search result: what it found, its snippet and the words that matched. */
export interface SearchHit {
  readonly entry: SearchEntry;
  /** About a line of its text around the first word that matched, or its text's start; empty before the text loads. */
  readonly snippet: string;
  /** The words of the document that matched, for highlighting. */
  readonly terms: readonly string[];
  readonly score: number;
}

/** The two indexes: titles, keywords and places load first; the full text after them. */
export interface SearchIndexes {
  readonly titles: MiniSearch<SearchDoc>;
  readonly text: MiniSearch<SearchDoc> | null;
}

const SUMMARY_LENGTH = 240;
const SNIPPET_LENGTH = 120;

/** How the titles index is built and searched; the build and the site use the same options. */
export const TITLE_OPTIONS: Options<SearchDoc> = {
  idField: "id",
  fields: ["title", "keywords"],
  storeFields: ["kind", "group", "title", "path", "href"],
  searchOptions: { boost: { title: 5, keywords: 2 }, prefix: true, fuzzy: 0.2 },
};

/** How the full-text index is built and searched. */
export const TEXT_OPTIONS: Options<SearchDoc> = {
  idField: "id",
  fields: ["text"],
  storeFields: ["summary"],
  extractField: (doc, field) => {
    switch (field) {
      case "id":
        return doc.id;
      case "summary":
        return doc.text.slice(0, SUMMARY_LENGTH);
      default:
        return doc.text;
    }
  },
  searchOptions: { prefix: true, fuzzy: 0.2 },
};

/** An exact title first, then a component's name, a heading, a prop or token, and body text last. */
const KIND_BOOST: Readonly<Record<SearchKind, number>> = {
  page: 1.6,
  component: 1.6,
  heading: 1.25,
  prop: 1,
  token: 1,
  example: 0.8,
};

const EXACT_TITLE_BOOST = 4;
const TEXT_WEIGHT = 0.4;

function isKind(value: unknown): value is SearchKind {
  return typeof value === "string" && value in KIND_BOOST;
}

function entryOf(
  id: string,
  stored: Record<string, unknown> | undefined,
): SearchEntry | null {
  if (!stored) return null;
  const { kind, group, title, path, href } = stored;
  if (
    !isKind(kind) ||
    typeof group !== "string" ||
    typeof title !== "string" ||
    typeof href !== "string" ||
    !Array.isArray(path)
  ) {
    return null;
  }
  return { id, kind, group, title, href, path: path.map(String) };
}

/** The query, or it and an alternative for each phrase in it that `searchSynonyms` maps to buttery's names. */
function expand(query: string): Query {
  const lower = query.toLowerCase();
  const alternatives = Object.entries(searchSynonyms).flatMap(
    ([phrase, names]) =>
      new RegExp(
        `(?:^|\\W)${phrase.replace(/[-\s]+/g, "[-\\s]+")}(?:$|\\W)`,
      ).test(lower)
        ? names
        : [],
  );
  return alternatives.length === 0
    ? query
    : { combineWith: "OR", queries: [query, ...alternatives] };
}

function snippetOf(summary: string, terms: readonly string[]): string {
  const lower = summary.toLowerCase();
  const at = terms
    .map((term) => lower.indexOf(term.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  if (at === undefined || at < SNIPPET_LENGTH / 2) {
    return summary.length > SNIPPET_LENGTH
      ? `${summary.slice(0, SNIPPET_LENGTH).trimEnd()}…`
      : summary;
  }
  const start = summary.lastIndexOf(" ", at - SNIPPET_LENGTH / 3) + 1;
  return `…${summary.slice(start, start + SNIPPET_LENGTH).trim()}…`;
}

/** The titles and full-text indexes of `docs`, for the build to write out and for tests. */
export function buildSearchIndexes(docs: readonly SearchDoc[]): {
  readonly titles: MiniSearch<SearchDoc>;
  readonly text: MiniSearch<SearchDoc>;
} {
  const titles = new MiniSearch<SearchDoc>(TITLE_OPTIONS);
  const text = new MiniSearch<SearchDoc>(TEXT_OPTIONS);
  titles.addAll([...docs]);
  text.addAll([...docs]);
  return { titles, text };
}

/** An index from the JSON the build wrote, with the options it was built with. */
export function loadIndex(
  json: string,
  options: Options<SearchDoc>,
): MiniSearch<SearchDoc> {
  return MiniSearch.loadJSON<SearchDoc>(json, options);
}

/**
 * The results for `query`, best first: from the titles index, and from the full text once it has loaded,
 * with synonyms expanded and exact titles and components ranked up.
 */
export function searchDocs(
  indexes: SearchIndexes,
  query: string,
  limit = 50,
): SearchHit[] {
  const text = query.trim();
  if (text === "") return [];
  const exact = text.toLowerCase();
  const expanded = expand(text);
  const boost = (stored: Record<string, unknown> | undefined): number => {
    const kind = stored?.["kind"];
    const base = isKind(kind) ? KIND_BOOST[kind] : 1;
    const title = stored?.["title"];
    return typeof title === "string" && title.toLowerCase() === exact
      ? base * EXACT_TITLE_BOOST
      : base;
  };
  const scores = new Map<
    string,
    { score: number; terms: Set<string>; summary: string }
  >();
  for (const result of indexes.titles.search(expanded, {
    boostDocument: (_id, _term, stored) => boost(stored),
  })) {
    scores.set(String(result.id), {
      score: result.score,
      terms: new Set(result.terms),
      summary: "",
    });
  }
  for (const result of indexes.text?.search(expanded) ?? []) {
    const id = String(result.id);
    const stored = indexes.titles.getStoredFields(id);
    const found = scores.get(id);
    const summary =
      typeof result["summary"] === "string" ? result["summary"] : "";
    const weighted = result.score * TEXT_WEIGHT * boost(stored);
    if (found) {
      found.score += weighted;
      found.summary = summary;
      for (const term of result.terms) found.terms.add(term);
    } else {
      scores.set(id, {
        score: weighted,
        terms: new Set(result.terms),
        summary,
      });
    }
  }
  const seen = new Set<string>();
  return [...scores.entries()]
    .sort(([, a], [, b]) => b.score - a.score)
    .flatMap(([id, { score, terms, summary }]) => {
      const entry = entryOf(id, indexes.titles.getStoredFields(id));
      if (!entry || seen.has(entry.href)) return [];
      seen.add(entry.href);
      return [
        {
          entry,
          score,
          terms: [...terms],
          snippet: snippetOf(summary, [...terms]),
        },
      ];
    })
    .slice(0, limit);
}
