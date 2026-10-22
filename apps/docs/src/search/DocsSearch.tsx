import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactElement, ReactNode } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import { CommandSearch, formatSearch } from "@buttery/react";
import type {
  SearchFilter,
  SearchItem,
  SearchQuery,
  SearchSource,
} from "@buttery/react";
import { initialValues } from "../LiveControls.tsx";
import { components, docsRouteOf, packageOf } from "../registry.ts";
import { SOURCE_URL } from "../routes.ts";
import { correctionFor, entryOf, searchDocs } from "./search.ts";
import type { SearchEntry, SearchHit, SearchIndexes } from "./search.ts";
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
  "Changelog",
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

/** What an empty search suggests: where most people start. Each id is its result's, so it previews too. */
export const SEARCH_SUGGESTIONS: readonly SearchItem[] = [
  {
    id: "page:get-started/quick-start",
    label: "Quick start",
    path: ["Get started"],
    href: "/get-started/quick-start",
  },
  {
    id: "component:Button",
    label: "Button",
    path: ["Components"],
    href: "/components/button",
  },
  {
    id: "component:Dialog",
    label: "Dialog",
    path: ["Components"],
    href: "/components/dialog",
  },
  {
    id: "page:foundations/theming",
    label: "Theming",
    path: ["Foundations"],
    href: "/foundations/theming",
  },
  {
    id: "page:layout/the-layout-contract",
    label: "The layout contract",
    path: ["Layout"],
    href: "/layout/the-layout-contract",
  },
];

/** Where "Ask for these docs" goes: a new issue on buttery's repository about what was searched for. */
export function askHref(search: string): string {
  return `${SOURCE_URL}/issues/new?title=${encodeURIComponent(`Docs: ${search}`)}`;
}

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

/** A component's live demo for a preview, left out when it's wider than the pane, as a table or a chart is. */
function PreviewDemo({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement | null {
  const box = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(true);
  useLayoutEffect(() => {
    const element = box.current;
    if (element) setFits(element.scrollWidth <= element.clientWidth + 1);
  }, []);
  return fits ? (
    <Surface ref={box} level="card" pad={3}>
      {children}
    </Surface>
  ) : null;
}

/** A result's preview: where it sits, its name and a line about it, and for a component its import and a small demo. */
function SearchPreview({
  entry,
  snippet,
}: {
  readonly entry: SearchEntry;
  readonly snippet: string;
}): ReactElement {
  const component =
    entry.kind === "component"
      ? components.find(
          (candidate) => `/${docsRouteOf(candidate) ?? ""}` === entry.href,
        )
      : undefined;
  const about = component
    ? (component.page?.description ?? component.meta.purpose)
    : snippet;
  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <Text variant="caption" tone="secondary">
          {entry.path.join(" › ")}
        </Text>
        <Text variant="title">{entry.title}</Text>
      </Stack>
      {about === "" ? null : (
        <Text variant="body-sm" tone="secondary">
          {about}
        </Text>
      )}
      {component ? (
        <code className="docs-code">{`import { ${component.meta.name} } from "${packageOf(component)}";`}</code>
      ) : null}
      {component?.live && component.frame !== "page" ? (
        <PreviewDemo key={component.meta.name}>
          {component.live.render(initialValues(component.live.controls))}
        </PreviewDemo>
      ) : null}
    </Stack>
  );
}

/** The preview of the result `item` stands for, from the loaded indexes, or nothing before they load. */
function previewOf(indexes: SearchIndexes | null, item: SearchItem): ReactNode {
  if (indexes === null) return null;
  const hit = last?.hits.find((candidate) => candidate.entry.id === item.id);
  const entry =
    hit?.entry ?? entryOf(item.id, indexes.titles.getStoredFields(item.id));
  return entry ? (
    <SearchPreview entry={entry} snippet={hit?.snippet ?? ""} />
  ) : null;
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
  const [search, setSearch] = useState("");

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
      value={search}
      onValueChange={setSearch}
      sources={searchSources(indexes)}
      filters={SEARCH_FILTERS}
      resultsHref={resultsHref}
      storageKey="docs"
      suggestions={SEARCH_SUGGESTIONS}
      didYouMean={(query) =>
        indexes === null ? undefined : correctionFor(indexes, query.text)
      }
      preview={(item) => previewOf(indexes, item)}
      emptyHint={
        <a href={askHref(search.trim())} className="docs-link">
          Ask for these docs
        </a>
      }
      onFocus={() => {
        void loadSearch();
      }}
    />
  );
}
