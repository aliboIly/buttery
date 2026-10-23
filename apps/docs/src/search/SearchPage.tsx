import { useEffect, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { SearchResults, parseSearch } from "@buttery/react";
import { useSettings } from "../location.ts";
import {
  SEARCH_FILTERS,
  askHref,
  resultsHref,
  searchSources,
} from "./DocsSearch.tsx";
import { correctionFor } from "./search.ts";
import { loadedSearch, loadSearch, subscribeSearch } from "./store.ts";

/** Every result for the `q` in the address, grouped by section, as "View all results" and Enter open it. */
export function SearchPage(): ReactElement {
  const { query: address } = useSettings();
  const text = new URLSearchParams(address).get("q") ?? "";
  const indexes = useSyncExternalStore(
    subscribeSearch,
    loadedSearch,
    () => null,
  );

  useEffect(() => {
    void loadSearch();
  }, []);

  const query = parseSearch(text, SEARCH_FILTERS, { sent: true });
  const correction =
    indexes === null ? undefined : correctionFor(indexes, query.text);
  return (
    <SearchResults
      key={text}
      query={query}
      sources={searchSources(indexes, query)}
      emptyHint={
        <>
          {correction === undefined ? (
            "Try another word, or a filter such as component:dialog. "
          ) : (
            <>
              {"Did you mean "}
              <a
                href={resultsHref({ filters: query.filters, text: correction })}
                className="docs-link"
              >
                {correction}
              </a>
              {"? "}
            </>
          )}
          <a href={askHref(text)} className="docs-link">
            Ask for these docs
          </a>
        </>
      }
    />
  );
}
