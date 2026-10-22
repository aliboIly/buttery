import { useEffect, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { SearchResults, parseSearch } from "@buttery/react";
import { useSettings } from "../location.ts";
import { SEARCH_FILTERS, searchSources } from "./DocsSearch.tsx";
import { loadedSearch, loadSearch, subscribeSearch } from "./store.ts";

/** Every result for the `q` in the address, grouped by section, as "View all results" and Enter open it. */
export function SearchPage(): ReactElement {
  const { query } = useSettings();
  const text = new URLSearchParams(query).get("q") ?? "";
  const indexes = useSyncExternalStore(
    subscribeSearch,
    loadedSearch,
    () => null,
  );

  useEffect(() => {
    void loadSearch();
  }, []);

  return (
    <SearchResults
      key={text}
      query={parseSearch(text, SEARCH_FILTERS, { sent: true })}
      sources={searchSources(indexes)}
      emptyHint="Try another word, or a filter such as component:dialog."
    />
  );
}
