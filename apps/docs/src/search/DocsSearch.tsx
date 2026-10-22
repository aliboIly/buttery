import { useEffect, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { CommandSearch, formatSearch } from "@buttery/react";
import type {
  SearchFilter,
  SearchItem,
  SearchQuery,
  SearchSource,
} from "@buttery/react";
import { searchDocs } from "./search.ts";
import type { SearchHit, SearchIndexes } from "./search.ts";
import { loadedSearch, loadSearch, subscribeSearch } from "./store.ts";

/** The results' groups, in the order the panel shows them. */
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
] as const;

/** The filters people can type, each narrowing the results to its groups. */
const FILTER_GROUPS: Readonly<Record<string, readonly string[]>> = {
  component: ["Components"],
  prop: ["Props"],
  token: ["Tokens"],
  guide: ["Guides", "Get started"],
};

/** The `key:value` filters the docs search takes. */
export const SEARCH_FILTERS: readonly SearchFilter[] = [
  { key: "component", description: "components only", example: "dialog" },
  { key: "prop", description: "props only", example: "onValueChange" },
  { key: "token", description: "tokens only", example: "--bt-r-lg" },
  { key: "guide", description: "guides only", example: "theming" },
];

/** How many results a search keeps: every group's panel rows, and a results page's sections in full. */
const RESULT_LIMIT = 500;

let last: {
  readonly key: string;
  readonly indexes: SearchIndexes;
  readonly hits: readonly SearchHit[];
} | null = null;

/** The query's results, worked out once for all the groups that ask in the same frame. */
function hitsFor(
  indexes: SearchIndexes,
  query: SearchQuery,
): readonly SearchHit[] {
  const words = [query.text, ...query.filters.map((filter) => filter.value)]
    .join(" ")
    .trim();
  const groups = query.filters.flatMap(
    (filter) => FILTER_GROUPS[filter.key] ?? [],
  );
  const key = `${words}\u0000${groups.join(",")}`;
  if (last?.key === key && last.indexes === indexes) return last.hits;
  const hits = searchDocs(indexes, words, RESULT_LIMIT).filter(
    (hit) => groups.length === 0 || groups.includes(hit.entry.group),
  );
  last = { key, indexes, hits };
  return hits;
}

/** A result as a row: its path without the group its heading already names, at most two places deep. */
function itemOf(hit: SearchHit): SearchItem {
  return {
    id: hit.entry.id,
    label: hit.entry.title,
    path: hit.entry.path.filter((place) => place !== hit.entry.group).slice(-2),
    detail: hit.snippet === "" ? undefined : hit.snippet,
    href: hit.entry.href,
  };
}

/** One source per group, answering from the loaded indexes in the frame the query changes. */
export function searchSources(indexes: SearchIndexes | null): SearchSource[] {
  return SEARCH_GROUPS.map((group) => ({
    id: group,
    label: group,
    limit: group === "Components" ? 6 : 4,
    search: (query: SearchQuery) =>
      indexes === null
        ? []
        : hitsFor(indexes, query)
            .filter((hit) => hit.entry.group === group)
            .map(itemOf),
  }));
}

/** The query as the results page's address, such as `/search?q=dialog`. */
export function resultsHref(query: SearchQuery): string {
  return `/search?q=${encodeURIComponent(formatSearch(query))}`;
}

/**
 * The docs search in the top bar: buttery's `CommandSearch` over the index the build makes, opened with
 * `/` or ⌘K. Its titles load while the browser is idle or on the first focus, and the full text after them.
 */
export function DocsSearch(): ReactElement {
  const indexes = useSyncExternalStore(
    subscribeSearch,
    loadedSearch,
    () => null,
  );

  useEffect(() => {
    const prefetch = (): void => {
      void loadSearch();
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => {
        window.cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(prefetch, 200);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  return (
    <CommandSearch
      label="Search the docs"
      sources={searchSources(indexes)}
      filters={SEARCH_FILTERS}
      resultsHref={resultsHref}
      storageKey="docs"
      onFocus={() => {
        void loadSearch();
      }}
    />
  );
}
