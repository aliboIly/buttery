import { Icon, cx, hasContent, tabbables } from "@buttery/core";
import { ChevronRight, Search } from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ReactElement, ReactNode } from "react";
import { Button } from "../../components/button/Button.tsx";
import { LoadingPill } from "../../components/loading-pill/LoadingPill.tsx";
import { AppPage } from "../app-page/AppPage.tsx";
import type { AppPageProps } from "../app-page/AppPage.tsx";
import { SearchHighlight } from "../command-search/CommandSearch.tsx";
import { formatSearch } from "../command-search/search.ts";
import type {
  LocalSearchSource,
  RemoteSearchSource,
  SearchItem,
  SearchQuery,
  SearchSource,
} from "../command-search/search.ts";
import { EmptyState } from "../empty-state/EmptyState.tsx";
import { PageHeader } from "../page-header/PageHeader.tsx";

/** The words a `SearchResults` page shows. */
export interface SearchResultsLabels {
  /** The page's title, such as `Results for "decaf"`. */
  readonly title: (search: string) => string;
  /** How many results there are, such as "12 results". */
  readonly count: (count: number) => string;
  /** What a section waiting on a server says. */
  readonly loading: string;
  /** Says nothing matched. */
  readonly noResults: (search: string) => string;
  /** The button under a section with more to show, such as "Show 50 more". */
  readonly showMore: (count: number) => string;
}

/** Props for `SearchResults`. */
export interface SearchResultsProps extends Omit<
  AppPageProps,
  "header" | "children" | "fill"
> {
  /** What was searched for, as `CommandSearch` hands it to `resultsHref` or `onSearch`. */
  readonly query: SearchQuery;
  /** Where to look: one section each, in this order, with every result rather than the panel's five. */
  readonly sources: readonly SearchSource[];
  /** A line under "No results", such as a link to the help site. */
  readonly emptyHint?: ReactNode;
  /** How many results a section shows before a "Show more" button under it adds as many again. Defaults to `50`. */
  readonly pageSize?: number | undefined;
  /** Its words, for another language or your own. */
  readonly labels?: Partial<SearchResultsLabels>;
}

const LABELS: SearchResultsLabels = {
  title: (search) => `Results for "${search}"`,
  count: (count) => `${String(count)} ${count === 1 ? "result" : "results"}`,
  loading: "Searching",
  noResults: (search) => `No results for "${search}"`,
  showMore: (count) => `Show ${String(count)} more`,
};

interface Answer {
  readonly key: string;
  readonly items: readonly SearchItem[];
}

function isLocal(source: SearchSource): source is LocalSearchSource {
  return source.remote !== true;
}

function isRemote(source: SearchSource): source is RemoteSearchSource {
  return source.remote === true;
}

function ResultRow({
  item,
  source,
  query,
}: {
  readonly item: SearchItem;
  readonly source: SearchSource;
  readonly query: SearchQuery;
}): ReactElement {
  const content =
    source.renderItem === undefined ? (
      <>
        {hasContent(item.media) ? (
          <span data-bt-part="search-results-media">{item.media}</span>
        ) : item.icon ? (
          <Icon icon={item.icon} data-bt-part="result-icon" />
        ) : null}
        <span
          className="bt-truncate"
          data-bt-truncate=""
          title={[...(item.path ?? []), item.label].join(" › ")}
          data-bt-part="search-results-label"
        >
          {item.path?.map((part) => (
            <span key={part} data-bt-part="search-results-path">
              <SearchHighlight text={part} query={query.text} />
              <Icon
                icon={ChevronRight}
                data-bt-part="search-results-path-chevron"
              />
            </span>
          ))}
          <SearchHighlight text={item.label} query={query.text} />
        </span>
        {item.detail === undefined ? null : (
          <span
            className="bt-truncate"
            data-bt-truncate=""
            title={item.detail}
            data-bt-part="search-results-detail"
          >
            {item.detail}
          </span>
        )}
      </>
    ) : (
      source.renderItem(item, query)
    );
  if (item.href !== undefined)
    return (
      <a
        href={item.href}
        onClick={item.onSelect}
        className="bt-focus"
        data-bt-part="result"
      >
        {content}
      </a>
    );
  if (item.onSelect !== undefined)
    return (
      <button
        type="button"
        onClick={item.onSelect}
        className="bt-focus"
        data-bt-part="result"
      >
        {content}
      </button>
    );
  return <div data-bt-part="result">{content}</div>;
}

function ResultList({
  items,
  source,
  query,
  pageSize,
  showMore,
}: {
  readonly items: readonly SearchItem[];
  readonly source: SearchSource;
  readonly query: SearchQuery;
  readonly pageSize: number;
  readonly showMore: (count: number) => string;
}): ReactElement {
  const [shown, setShown] = useState(pageSize);
  const list = useRef<HTMLUListElement>(null);
  const rest = items.length - shown;
  return (
    <>
      <ul ref={list} data-bt-part="results">
        {items.slice(0, shown).map((item, index) => (
          <li key={`${item.id}:${String(index)}`}>
            <ResultRow item={item} source={source} query={query} />
          </li>
        ))}
      </ul>
      {rest > 0 ? (
        <div data-bt-part="search-results-more">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              flushSync(() => {
                setShown(shown + pageSize);
              });
              // Focus goes to the first row it showed, rather than staying on a button that moved past them.
              const [first] = [...(list.current?.children ?? [])]
                .slice(shown)
                .flatMap((row) => tabbables(row));
              first?.focus();
            }}
          >
            {showMore(Math.min(pageSize, rest))}
          </Button>
        </div>
      ) : null}
    </>
  );
}

/**
 * A page of every result for a search, in an `AppPage`: its title says what was searched for and its
 * description how many results there are; then a section for each source that found something, with every
 * result as a row (its path, the label with the matching characters highlighted, a detail), each row a link,
 * 50 at first and then 50 more at a time under a "Show more" button. A remote source's section shows a
 * loading pill until it answers. With nothing found, an empty state says
 * so, with `emptyHint` under it. It's where `CommandSearch`'s "View all results" leads.
 *
 * @example
 * <SearchResults query={parseSearch(params.get("q") ?? "", filters, { sent: true })} sources={[pages, orders, help]} />
 */
export function SearchResults({
  query,
  sources,
  emptyHint,
  pageSize = 50,
  labels,
  className,
  ...rest
}: SearchResultsProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const key = formatSearch(query);
  const search = key.trim();
  const local = useMemo(
    () =>
      new Map(
        sources
          .filter(isLocal)
          .map((source) => [source.id, source.search(query)] as const),
      ),
    [sources, query],
  );
  const [remote, setRemote] = useState<Readonly<Record<string, Answer>>>({});

  const remoteIds = sources
    .filter(isRemote)
    .map((source) => source.id)
    .join("\n");
  const askRemote = useEffectEvent((signal: AbortSignal): void => {
    for (const source of sources.filter(isRemote)) {
      void source.search(query, signal).then(
        (items) => {
          if (signal.aborted) return;
          setRemote((all) => ({ ...all, [source.id]: { key, items } }));
        },
        (error: unknown) => {
          if (signal.aborted) return;
          reportError(error);
          setRemote((all) => ({ ...all, [source.id]: { key, items: [] } }));
        },
      );
    }
  });

  // Keyed by what's asked, so a parent re-rendering with an inline query or sources doesn't ask again.
  useEffect(() => {
    if (remoteIds === "") return undefined;
    const controller = new AbortController();
    askRemote(controller.signal);
    return () => {
      controller.abort();
    };
  }, [remoteIds, key]);

  const sections = sources
    .map((source) => {
      const answer = isRemote(source)
        ? remote[source.id]
        : { key, items: local.get(source.id) ?? [] };
      return answer?.key === key
        ? { source, loading: false, items: answer.items }
        : { source, loading: true, items: [] };
    })
    .filter((section) => section.loading || section.items.length > 0);
  const total = sections.reduce(
    (count, section) => count + section.items.length,
    0,
  );
  const waiting = sections.some((section) => section.loading);

  return (
    <AppPage
      data-bt="SearchResults"
      {...rest}
      className={cx("bt-search-results", className)}
      header={
        <PageHeader
          title={words.title(search)}
          description={
            waiting && total === 0 ? words.loading : words.count(total)
          }
        />
      }
    >
      {sections.length === 0 ? (
        <AppPage.Section>
          <EmptyState
            icon={Search}
            title={words.noResults(search)}
            description={emptyHint}
          />
        </AppPage.Section>
      ) : (
        sections.map(({ source, loading, items }) => (
          <AppPage.Section
            key={source.id}
            title={source.label}
            description={loading ? undefined : words.count(items.length)}
          >
            {loading ? (
              <div data-bt-part="search-results-loading">
                <LoadingPill label={words.loading} />
              </div>
            ) : (
              <ResultList
                key={key}
                items={items}
                source={source}
                query={query}
                pageSize={pageSize}
                showMore={words.showMore}
              />
            )}
          </AppPage.Section>
        ))
      )}
    </AppPage>
  );
}
