import MiniSearch from "minisearch";
import type { Options, Query } from "minisearch";
import { searchSynonyms } from "./synonyms.ts";

/** What a search result is, which sets the group it shows under and how it ranks. */
export type SearchKind =
  "page" | "component" | "heading" | "prop" | "token" | "example" | "release";

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

/**
 * The docs search's `key:value` filters, each keeping the results it names: `component:` keeps components
 * wherever their pages are, and `guide:` the guides and the Get started pages.
 */
export const FILTER_KEEPS: Readonly<
  Record<string, (entry: SearchEntry) => boolean>
> = {
  component: (entry) => entry.kind === "component",
  prop: (entry) => entry.kind === "prop",
  token: (entry) => entry.kind === "token",
  guide: (entry) => entry.group === "Guides" || entry.group === "Get started",
};

/** The results' groups, in the order the panel shows those whose best results tie, as groups without any do. */
export const SEARCH_GROUPS = [
  "Components",
  "Get started",
  "Guides",
  "Foundations",
  "Layout",
  "Motion",
  "Patterns",
  "Templates",
  "Tools",
  "Resources",
  "Props",
  "Tokens",
  "Examples",
  "Changelog",
] as const;

/**
 * `SEARCH_GROUPS` in the order of each one's best result in `hits`, which are best first, so the panel opens
 * on the query's best result whichever group it's in.
 */
export function groupsByBest(hits: readonly SearchHit[]): string[] {
  const best = new Map<string, number>();
  hits.forEach((hit, at) => {
    if (!best.has(hit.entry.group)) best.set(hit.entry.group, at);
  });
  return SEARCH_GROUPS.map((group, at) => ({
    group,
    at,
    best: best.get(group) ?? Number.POSITIVE_INFINITY,
  }))
    .sort((a, b) => a.best - b.best || a.at - b.at)
    .map(({ group }) => group);
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
  release: 0.8,
};

const EXACT_TITLE_BOOST = 4;
const TEXT_WEIGHT = 0.4;

function isKind(value: unknown): value is SearchKind {
  return typeof value === "string" && value in KIND_BOOST;
}

/** The result `id` names, from the titles index, or `null` when there's none. */
export function entryOf(
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

/** `summary` from `start`, at most a snippet long, ending in an ellipsis only where it was cut short. */
function clip(summary: string, start: number): string {
  const end = start + SNIPPET_LENGTH;
  const part = summary.slice(start, end).trim();
  return end >= summary.length ? part : `${part.replace(/[\s.,;:!?]+$/, "")}…`;
}

function snippetOf(summary: string, terms: readonly string[]): string {
  const lower = summary.toLowerCase();
  const at = terms
    .map((term) => lower.indexOf(term.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  if (at === undefined || at < SNIPPET_LENGTH / 2) return clip(summary, 0);
  const start = summary.lastIndexOf(" ", at - SNIPPET_LENGTH / 3) + 1;
  return `…${clip(summary, start)}`;
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
 * with synonyms expanded and exact titles and components ranked up. A page or component whose title is the
 * query comes first, whatever the rest score.
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
  const named = (entry: SearchEntry): boolean =>
    (entry.kind === "page" || entry.kind === "component") &&
    entry.title.toLowerCase() === exact;
  const seen = new Set<string>();
  return [...scores.entries()]
    .flatMap(([id, found]) => {
      const entry = entryOf(id, indexes.titles.getStoredFields(id));
      return entry ? [{ entry, first: named(entry), ...found }] : [];
    })
    .sort((a, b) => Number(b.first) - Number(a.first) || b.score - a.score)
    .flatMap(({ entry, score, terms, summary }) => {
      if (seen.has(entry.href)) return [];
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

/**
 * A nearby search that finds something, for a query that found nothing, such as "dialog" for "dailog": the
 * titles index's closest suggestion, allowing more typos than a search does.
 */
export function correctionFor(
  indexes: SearchIndexes,
  query: string,
): string | undefined {
  const text = query.trim().toLowerCase();
  if (text === "") return undefined;
  const [best] = indexes.titles.autoSuggest(text, { fuzzy: 0.34 });
  const suggestion = best?.suggestion;
  return suggestion !== undefined &&
    suggestion !== text &&
    searchDocs(indexes, suggestion, 1).length > 0
    ? suggestion
    : undefined;
}
