import {
  Icon,
  Kbd,
  Popover,
  ariaKeyShortcuts,
  cx,
  hasContent,
  shortcutKeys,
  timing,
  useAnimationTracking,
  useApplePlatform,
  useControllableState,
  useLayoutAnimation,
  useMergedRefs,
  useShortcut,
  useStoredState,
} from "@buttery/core";
import { ChevronRight, Clock, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import type { MotionStyle } from "motion/react";
import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { Spinner } from "../../parts/spinner/Spinner.tsx";
import { formatSearch, matchRanges, parseSearch } from "./search.ts";
import type {
  LocalSearchSource,
  RemoteSearchSource,
  SearchFilter,
  SearchItem,
  SearchQuery,
  SearchSource,
} from "./search.ts";

/** The words a `CommandSearch` shows and announces. */
export interface CommandSearchLabels {
  /** Names the list of rows under the field. */
  readonly results: string;
  /** Heads the filters it suggests. */
  readonly filters: string;
  /** Heads the recent searches. */
  readonly recent: string;
  /** The link to every filter, under an empty search. */
  readonly moreFilters: string;
  /** The link to every result, under the groups. */
  readonly allResults: string;
  /** Says nothing matched, such as `No results for "decaf"`. */
  readonly noResults: (text: string) => string;
  /** The row a remote group shows while it's asking, such as "Searching orders". */
  readonly searching: (source: string) => string;
  /** Names the clear button. */
  readonly clear: string;
  /** Names a chip's remove button, such as "Remove status:shipped". */
  readonly removeFilter: (token: string) => string;
  /** Describes the field while it holds finished filters, such as "Filtered by status:shipped". */
  readonly filtering: (tokens: readonly string[]) => string;
  /** Announces how many results its sources found, such as "12 results". */
  readonly resultCount: (count: number) => string;
  /** Announces how many filters it suggests while nothing has been found, such as "4 suggestions". */
  readonly suggestionCount: (count: number) => string;
}

/** Props for `CommandSearch`. `ref` and other input props go to the input; `className` and `style` to the field. */
export interface CommandSearchProps extends Omit<
  ComponentPropsWithRef<"input">,
  "size" | "value" | "defaultValue" | "children" | "type" | "style"
> {
  /** Inline styles for the field, which can include motion values. */
  readonly style?: MotionStyle | undefined;
  /** Names the field for screen readers, and shows as its placeholder unless there's one. Defaults to `"Search"`. */
  readonly label?: string | undefined;
  /** What's in the field, finished filters included, such as `"status:shipped decaf"`. Pair with `onValueChange`. */
  readonly value?: string | undefined;
  /** What's in the field at first when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with what's in the field on every change. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Where it looks: one group each in the panel, in this order. */
  readonly sources: readonly SearchSource[];
  /** The `key:value` filters people can type, suggested while the field is empty and as they type a key. */
  readonly filters?: readonly SearchFilter[] | undefined;
  /** Where the "View more filters" link under an empty search goes. Leave it out for no link. */
  readonly filtersHref?: string | undefined;
  /** Where "View all results" and Enter with no row chosen go, such as a `SearchResults` page. */
  readonly resultsHref?: ((query: SearchQuery) => string) | undefined;
  /** Called when someone asks for every result: Enter with no row chosen, or "View all results". */
  readonly onSearch?: ((query: SearchQuery) => void) | undefined;
  /** Remembers the last five searches under this key, listed while the field is empty. */
  readonly storageKey?: string | undefined;
  /** Whether `/` and ⌘K (Ctrl K) focus it from anywhere. Defaults to `true`. */
  readonly shortcut?: boolean | undefined;
  /** A line under "No results", such as a link to the help site. */
  readonly emptyHint?: ReactNode;
  /** Its words, for another language or your own. */
  readonly labels?: Partial<CommandSearchLabels> | undefined;
}

const LABELS: CommandSearchLabels = {
  results: "Results",
  filters: "Suggested filters",
  recent: "Recent searches",
  moreFilters: "View more filters",
  allResults: "View all results",
  noResults: (text) => `No results for "${text}"`,
  searching: (source) => `Searching ${source.toLowerCase()}`,
  clear: "Clear search",
  removeFilter: (token) => `Remove ${token}`,
  filtering: (tokens) => `Filtered by ${tokens.join(", ")}`,
  resultCount: (count) =>
    count === 1 ? "1 result" : `${String(count)} results`,
  suggestionCount: (count) =>
    count === 1 ? "1 suggestion" : `${String(count)} suggestions`,
};

const NO_FILTERS: readonly SearchFilter[] = [];
const RECENT_LIMIT = 5;
const GROUP_LIMIT = 5;
const SUGGESTION_LIMIT = 6;

type PanelOption =
  | { readonly kind: "filter"; readonly filter: SearchFilter }
  | {
      readonly kind: "value";
      readonly filter: SearchFilter;
      readonly value: string;
    }
  | { readonly kind: "recent"; readonly search: string }
  | {
      readonly kind: "item";
      readonly source: SearchSource;
      readonly item: SearchItem;
    };

interface PanelGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly PanelOption[];
  readonly loading: boolean;
  /** How many results its source found, more than it shows when it found more than its limit. */
  readonly found: number;
}

interface RemoteResult {
  readonly query: string;
  readonly items: readonly SearchItem[];
}

function isLocal(source: SearchSource): source is LocalSearchSource {
  return source.remote !== true;
}

function isRemote(source: SearchSource): source is RemoteSearchSource {
  return source.remote === true;
}

function isSearches(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function keyOf(option: PanelOption): string {
  switch (option.kind) {
    case "filter":
      return `filter:${option.filter.key}`;
    case "value":
      return `value:${option.filter.key}:${option.value}`;
    case "recent":
      return `recent:${option.search}`;
    case "item":
      return `item:${option.item.id}`;
    default: {
      const unknown: never = option;
      return unknown;
    }
  }
}

function suggestFilters(
  filters: readonly SearchFilter[],
  typing: string,
  empty: boolean,
): readonly PanelOption[] {
  if (empty)
    return filters
      .slice(0, SUGGESTION_LIMIT)
      .map((filter) => ({ kind: "filter", filter }));
  if (typing === "") return [];
  const colon = typing.indexOf(":");
  const typedKey = (
    colon === -1 ? typing : typing.slice(0, colon)
  ).toLowerCase();
  const exact = filters.find((filter) => filter.key.toLowerCase() === typedKey);
  if (colon !== -1 || exact?.values !== undefined) {
    if (exact === undefined) return [];
    if (exact.values === undefined) return [{ kind: "filter", filter: exact }];
    const partial = colon === -1 ? "" : typing.slice(colon + 1).toLowerCase();
    return exact.values
      .filter((value) => value.toLowerCase().startsWith(partial))
      .slice(0, GROUP_LIMIT)
      .map((value) => ({ kind: "value", filter: exact, value }));
  }
  return filters
    .filter((filter) => filter.key.toLowerCase().startsWith(typedKey))
    .slice(0, 3)
    .map((filter) => ({ kind: "filter", filter }));
}

/** Props for `SearchHighlight`. */
export interface SearchHighlightProps {
  /** The words to draw, such as a result's label. */
  readonly text: string;
  /** The search, whose words are marked where they appear in `text`. */
  readonly query: string;
}

/**
 * Draws `text` with the characters that match a search marked, as `CommandSearch` and `SearchResults` draw
 * their results; use it in a source's `renderItem` to match them.
 *
 * @example
 * <SearchHighlight text="Team notifications" query="not" />
 */
export function SearchHighlight({
  text,
  query,
}: SearchHighlightProps): ReactElement {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [start, end] of matchRanges(text, query)) {
    if (start > at) parts.push(text.slice(at, start));
    parts.push(
      <mark key={start} className="bt-search-match">
        {text.slice(start, end)}
      </mark>,
    );
    at = end;
  }
  if (at < text.length) parts.push(text.slice(at));
  return <>{parts}</>;
}

/**
 * The top bar's search: a soft field, 360 wide at rest, that widens to 600 on `spring.smooth` as it takes focus
 * over a panel as wide as itself, anchored under it. An empty field lists the filters you can type and recent
 * searches; typing shows a group for each source that found something, up to five each, the matching
 * characters highlighted, then a link to every result. Finished `key:value` filters turn into chips in the
 * field; Tab completes a key. Local sources answer in the same frame; remote ones are asked 120ms after typing
 * stops and show a spinner row in their own group meanwhile. With nothing found, the panel keeps its size.
 * `/` and ⌘K focus it; arrows move through the rows; Enter opens one; Escape clears, then closes.
 *
 * @example
 * <CommandSearch
 *   sources={[pageSource({ pages }), ordersSource]}
 *   filters={[{ key: "status", example: "shipped", description: "where an order has got to", values: ["paid", "shipped"] }]}
 *   resultsHref={(query) => `/search?q=${encodeURIComponent(formatSearch(query))}`}
 *   storageKey="roastery"
 * />
 */
export function CommandSearch({
  label = "Search",
  value,
  defaultValue,
  onValueChange,
  sources,
  filters = NO_FILTERS,
  filtersHref,
  resultsHref,
  onSearch,
  storageKey,
  shortcut = true,
  emptyHint,
  labels,
  placeholder,
  className,
  style,
  ref,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onClick,
  onCompositionStart,
  onCompositionEnd,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: CommandSearchProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const query = useMemo(
    () => parseSearch(current, filters),
    [current, filters],
  );
  const submitted = useMemo(
    () => parseSearch(current, filters, { sent: true }),
    [current, filters],
  );
  const queryKey = formatSearch(query);
  const empty = query.text.trim() === "" && query.filters.length === 0;
  const typing = /\S+$/.exec(query.text)?.[0] ?? "";
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState<{
    readonly value: string;
    readonly id: string;
  } | null>(null);
  const [remote, setRemote] = useState<Readonly<Record<string, RemoteResult>>>(
    {},
  );
  const [recent, setRecent] = useStoredState<readonly string[]>(
    storageKey === undefined
      ? undefined
      : `buttery:command-search-recent:${storageKey}`,
    [],
    isSearches,
  );
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const composed = useRef(false);
  const field = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const allResults = useRef<HTMLAnchorElement>(null);
  const heldHeight = useRef(0);
  const [panelWidth, setPanelWidth] = useState(0);
  const refs = useMergedRefs(ref, input);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const footerId = `${baseId}-footer`;
  const tokensId = `${baseId}-filters`;
  const apple = useApplePlatform();
  const widen = useLayoutAnimation("smooth");
  const tracking = useAnimationTracking();
  const keepSize = useLayoutAnimation("smooth", "position");
  const remoteIds = sources
    .filter(isRemote)
    .map((source) => source.id)
    .join("\n");

  const focusField = (event: globalThis.KeyboardEvent): void => {
    event.preventDefault();
    setDismissed(false);
    input.current?.focus();
  };
  useShortcut("/", focusField, { enabled: shortcut && disabled !== true });
  useShortcut("mod+k", focusField, {
    enabled: shortcut && disabled !== true,
    inFields: true,
  });

  const localResults = useMemo(
    () =>
      new Map(
        empty
          ? []
          : sources
              .filter(isLocal)
              .map((source) => [source.id, source.search(query)] as const),
      ),
    [empty, sources, query],
  );

  const askRemote = useEffectEvent((signal: AbortSignal): void => {
    for (const source of sources.filter(isRemote)) {
      void source.search(query, signal).then(
        (items) => {
          if (signal.aborted) return;
          setRemote((all) => ({
            ...all,
            [source.id]: { query: queryKey, items },
          }));
        },
        (error: unknown) => {
          if (signal.aborted) return;
          reportError(error);
          setRemote((all) => ({
            ...all,
            [source.id]: { query: queryKey, items: [] },
          }));
        },
      );
    }
  });

  // Remote sources are asked once typing has paused, keyed by what's asked rather than by the props'
  // identity, so a parent re-rendering with inline sources or filters doesn't start the request over.
  useEffect(() => {
    if (empty || remoteIds === "") return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      askRemote(controller.signal);
    }, timing["delay-search"]);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [empty, remoteIds, queryKey]);

  const groups: PanelGroup[] = [];
  const suggestions = suggestFilters(filters, typing, empty);
  if (suggestions.length > 0)
    groups.push({
      id: "filters",
      label: words.filters,
      options: suggestions,
      loading: false,
      found: 0,
    });
  if (empty && recent.length > 0)
    groups.push({
      id: "recent",
      label: words.recent,
      options: recent.map((search) => ({ kind: "recent", search })),
      loading: false,
      found: 0,
    });
  if (!empty) {
    for (const source of sources) {
      const result = isRemote(source)
        ? remote[source.id]
        : { query: queryKey, items: localResults.get(source.id) ?? [] };
      const loading = isRemote(source) && result?.query !== queryKey;
      // A remote group keeps its last answer while a refined search is asked, but not one for a different search.
      const kept =
        result !== undefined &&
        (queryKey.startsWith(result.query) ||
          result.query.startsWith(queryKey));
      const all = kept ? result.items : [];
      const items = all.slice(0, source.limit ?? GROUP_LIMIT);
      if (items.length === 0 && !loading) continue;
      groups.push({
        id: `source:${source.id}`,
        label: source.label,
        options: items.map((item) => ({ kind: "item", source, item })),
        loading,
        found: all.length,
      });
    }
  }
  // A row's id comes from its group and what it is, so it stays with its row when another group's answer
  // arrives, and a highlight never moves onto a different result.
  const counted = new Map<string, number>();
  const placed = groups.map((group) => ({
    group,
    rows: group.options.map((option) => {
      const id = `${baseId}-${encodeURIComponent(`${group.id}|${keyOf(option)}`)}`;
      const seen = counted.get(id) ?? 0;
      counted.set(id, seen + 1);
      return { id: seen === 0 ? id : `${id}-${String(seen + 1)}`, option };
    }),
  }));
  const footerLink = empty
    ? filtersHref !== undefined
    : resultsHref !== undefined || onSearch !== undefined;
  const rows: readonly {
    readonly id: string;
    readonly option?: PanelOption;
  }[] = [
    ...placed.flatMap((entry) => entry.rows),
    ...(footerLink ? [{ id: footerId }] : []),
  ];
  const activeId =
    active !== null &&
    active.value === current &&
    rows.some((row) => row.id === active.id)
      ? active.id
      : undefined;
  const noResults = !empty && groups.length === 0;
  const panelOpen =
    focused &&
    !dismissed &&
    disabled !== true &&
    (groups.length > 0 || !empty || footerLink);
  const tokens = query.filters.map((token) => `${token.key}:${token.value}`);
  const found = groups.reduce((count, group) => count + group.found, 0);
  const status =
    !panelOpen || empty || groups.some((group) => group.loading)
      ? ""
      : [
          ...(tokens.length > 0 ? [words.filtering(tokens)] : []),
          noResults
            ? words.noResults(
                query.text.trim() === "" ? tokens.join(" ") : query.text.trim(),
              )
            : found > 0
              ? words.resultCount(found)
              : words.suggestionCount(suggestions.length),
        ].join(". ");
  const [announced, setAnnounced] = useState("");

  // What it found is announced once typing has paused, rather than on every key.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnounced(status);
    }, timing["delay-loading"]);
    return () => {
      window.clearTimeout(timer);
    };
  }, [status]);

  // The panel takes the field's width before it first paints, and follows it as the window resizes. Radix's
  // own width variable is set while the browser is delivering ResizeObserver notifications, which would
  // resize the panel in the middle of them.
  useLayoutEffect(() => {
    const element = field.current;
    if (!element || !panelOpen) return undefined;
    setPanelWidth(element.offsetWidth);
    const observer = new ResizeObserver(() => {
      setPanelWidth(element.offsetWidth);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [panelOpen]);

  useLayoutEffect(() => {
    if (activeId === undefined) return;
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  // With nothing found, the panel holds the height it last had with results, so it doesn't jump.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element) return;
    if (noResults) {
      element.style.minBlockSize =
        heldHeight.current > 0 ? `${String(heldHeight.current)}px` : "";
      return;
    }
    element.style.minBlockSize = "";
    heldHeight.current = element.offsetHeight;
  });

  const update = (next: string): void => {
    setDismissed(false);
    setCurrent(next);
    if (next === "") setRemote({});
  };
  const replaceTyping = (next: string): void => {
    update(
      formatSearch({
        filters: query.filters,
        text: `${query.text.slice(0, query.text.length - typing.length)}${next}`,
      }),
    );
  };
  const remember = (): void => {
    const search = formatSearch(submitted).trim();
    if (search === "" || storageKey === undefined) return;
    setRecent((list) =>
      [search, ...list.filter((entry) => entry !== search)].slice(
        0,
        RECENT_LIMIT,
      ),
    );
  };
  const finish = (leaving: boolean): void => {
    setCurrent("");
    setRemote({});
    setDismissed(true);
    if (leaving) input.current?.blur();
  };
  const choose = (option: PanelOption): void => {
    switch (option.kind) {
      case "filter":
        replaceTyping(`${option.filter.key}:`);
        return;
      case "value":
        replaceTyping(`${option.filter.key}:${option.value} `);
        return;
      case "recent":
        update(
          formatSearch(parseSearch(option.search, filters, { sent: true })),
        );
        return;
      case "item":
        remember();
        option.item.onSelect?.();
        finish(option.item.href !== undefined);
        return;
      default: {
        const unknown: never = option;
        return unknown;
      }
    }
  };
  const searchAll = (): void => {
    if (empty) return;
    remember();
    onSearch?.(submitted);
    finish(true);
  };
  const move = (step: 1 | -1): void => {
    if (rows.length === 0) return;
    const at = rows.findIndex((row) => row.id === activeId);
    const next =
      at === -1
        ? step === 1
          ? 0
          : rows.length - 1
        : (at + step + rows.length) % rows.length;
    const row = rows[next];
    if (row) setActive({ value: current, id: row.id });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    if (
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      composing.current ||
      composed.current
    )
      return;
    const activeRow = rows.find((row) => row.id === activeId);
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        setDismissed(false);
        move(event.key === "ArrowDown" ? 1 : -1);
        return;
      case "Enter":
        if (!panelOpen) return;
        event.preventDefault();
        if (activeRow !== undefined) {
          document.getElementById(activeRow.id)?.click();
          return;
        }
        allResults.current?.click();
        return;
      case "Tab": {
        if (!panelOpen || event.shiftKey) return;
        if (
          activeRow?.option?.kind === "filter" ||
          activeRow?.option?.kind === "value"
        ) {
          event.preventDefault();
          choose(activeRow.option);
          return;
        }
        const key = typing.includes(":")
          ? undefined
          : filters.find((filter) =>
              filter.key.toLowerCase().startsWith(typing.toLowerCase()),
            );
        if (typing === "" || key === undefined) return;
        event.preventDefault();
        replaceTyping(`${key.key}:`);
        return;
      }
      case "Backspace": {
        const element = event.currentTarget;
        if (
          query.filters.length === 0 ||
          element.selectionStart !== 0 ||
          element.selectionEnd !== 0
        )
          return;
        event.preventDefault();
        update(
          formatSearch({
            filters: query.filters.slice(0, -1),
            text: query.text,
          }),
        );
        return;
      }
      case "Escape":
        if (current === "") return;
        event.preventDefault();
        update("");
        return;
      default:
        return;
    }
  };

  const renderOption = (option: PanelOption, id: string): ReactNode => {
    const selected = id === activeId;
    const common = {
      id,
      role: "option",
      "aria-selected": selected,
      "data-active": selected ? "" : undefined,
      "data-kind": option.kind,
      "data-bt-part": "command-search-option",
      onPointerMove: () => {
        if (!selected) setActive({ value: current, id });
      },
      onClick: () => {
        choose(option);
      },
    } as const;
    switch (option.kind) {
      case "filter":
        return (
          <div key={id} {...common}>
            <span
              className="bt-text"
              data-role="caption"
              data-bt-part="command-search-key"
            >
              {`${option.filter.key}:`}
            </span>
            <span data-bt-part="example">{`${option.filter.key}:${option.filter.example}`}</span>
            <span
              className="bt-truncate"
              data-bt-truncate=""
              title={option.filter.description}
              data-bt-part="command-search-description"
            >
              {option.filter.description}
            </span>
          </div>
        );
      case "value":
        return (
          <div key={id} {...common}>
            <span
              className="bt-text"
              data-role="caption"
              data-bt-part="command-search-key"
            >
              {`${option.filter.key}:${option.value}`}
            </span>
          </div>
        );
      case "recent":
        return (
          <div key={id} {...common}>
            <Icon icon={Clock} data-bt-part="option-icon" />
            <span
              className="bt-truncate"
              data-bt-truncate=""
              title={option.search}
              data-bt-part="command-search-label"
            >
              {option.search}
            </span>
          </div>
        );
      case "item": {
        const { item, source } = option;
        const content =
          source.renderItem === undefined ? (
            <>
              {hasContent(item.media) ? (
                <span data-bt-part="command-search-media">{item.media}</span>
              ) : item.icon ? (
                <Icon icon={item.icon} data-bt-part="option-icon" />
              ) : null}
              <span
                className="bt-truncate"
                data-bt-truncate=""
                title={[...(item.path ?? []), item.label].join(" › ")}
                data-bt-part="command-search-label"
              >
                {item.path?.map((part) => (
                  <span key={part} data-bt-part="command-search-path">
                    <SearchHighlight text={part} query={query.text} />
                    <Icon
                      icon={ChevronRight}
                      data-bt-part="command-search-path-chevron"
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
                  data-bt-part="command-search-detail"
                >
                  {item.detail}
                </span>
              )}
            </>
          ) : (
            source.renderItem(item, query)
          );
        return item.href === undefined ? (
          <div key={id} {...common}>
            {content}
          </div>
        ) : (
          <a key={id} {...common} href={item.href} tabIndex={-1}>
            {content}
          </a>
        );
      }
      default: {
        const unknown: never = option;
        return unknown;
      }
    }
  };

  const footerProps = (selected: boolean) =>
    ({
      id: footerId,
      role: "option",
      "aria-selected": selected,
      "data-active": selected ? "" : undefined,
      tabIndex: -1,
      className: "bt-text",
      "data-role": "label",
      "data-bt-part": "footer-link",
      onPointerMove: () => {
        if (!selected) setActive({ value: current, id: footerId });
      },
    }) as const;

  return (
    <Popover
      open={panelOpen}
      onOpenChange={(next) => {
        if (!next) setDismissed(true);
      }}
      entrance="instant"
    >
      <Popover.Anchor asChild>
        <motion.div
          {...widen}
          onLayoutAnimationStart={tracking.onLayoutAnimationStart}
          onLayoutAnimationComplete={tracking.onLayoutAnimationComplete}
          ref={field}
          className={cx("bt-command-search", className)}
          style={style ?? {}}
          data-bt="CommandSearch"
          data-focused={focused ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          data-bt-control=""
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            )
              return;
            setFocused(false);
          }}
          onMouseDown={(event) => {
            if (
              disabled === true ||
              (event.target instanceof Element &&
                event.target.closest("input, button") !== null)
            )
              return;
            event.preventDefault();
            setDismissed(false);
            input.current?.focus();
          }}
        >
          <motion.span {...keepSize} data-bt-part="icon">
            <Icon icon={Search} />
          </motion.span>
          {tokens.length > 0 ? (
            <motion.span {...keepSize} data-bt-part="chips">
              {tokens.map((token, index) => (
                <span key={`${token}-${String(index)}`} data-bt-part="chip">
                  <span
                    className="bt-text bt-truncate"
                    data-role="caption"
                    data-bt-truncate=""
                    title={token}
                  >
                    {token}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={words.removeFilter(token)}
                    className="bt-focus"
                    data-bt-part="chip-remove"
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => {
                      update(
                        formatSearch({
                          filters: query.filters.filter(
                            (_, place) => place !== index,
                          ),
                          text: query.text,
                        }),
                      );
                      input.current?.focus();
                    }}
                  >
                    <Icon icon={X} />
                    <span
                      data-bt-part="hit"
                      data-bt-hit=""
                      aria-hidden="true"
                    />
                  </button>
                </span>
              ))}
            </motion.span>
          ) : null}
          <motion.span {...keepSize} data-bt-part="input-frame">
            <input
              {...rest}
              ref={refs}
              type="search"
              role="combobox"
              aria-label={label}
              aria-expanded={panelOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={panelOpen ? activeId : undefined}
              aria-describedby={
                [describedBy, tokens.length > 0 ? tokensId : undefined]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              aria-keyshortcuts={
                shortcut
                  ? `${ariaKeyShortcuts("/", apple)} ${ariaKeyShortcuts("mod+k", apple)}`
                  : undefined
              }
              placeholder={placeholder ?? label}
              value={query.text}
              disabled={disabled}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                onChange?.(event);
                update(
                  formatSearch({
                    filters: query.filters,
                    text: event.target.value,
                  }),
                );
              }}
              onKeyDown={handleKeyDown}
              onCompositionStart={(event) => {
                onCompositionStart?.(event);
                composing.current = true;
              }}
              onCompositionEnd={(event) => {
                onCompositionEnd?.(event);
                composing.current = false;
                // WebKit sends the key that ended the composition after compositionend.
                composed.current = true;
                requestAnimationFrame(() => {
                  composed.current = false;
                });
              }}
              onClick={(event) => {
                onClick?.(event);
                setDismissed(false);
              }}
              onFocus={(event) => {
                onFocus?.(event);
                setDismissed(false);
              }}
              onBlur={(event) => {
                onBlur?.(event);
                composed.current = false;
              }}
              data-bt-part="command-search-input"
            />
          </motion.span>
          <motion.span {...keepSize} data-bt-part="end">
            {current === "" ? (
              shortcut ? (
                <Kbd
                  keys={shortcutKeys("/")}
                  aria-hidden="true"
                  data-bt-part="shortcut"
                />
              ) : null
            ) : (
              <IconButton
                icon={X}
                label={words.clear}
                size="sm"
                tooltip={false}
                disabled={disabled}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  update("");
                  input.current?.focus();
                }}
              />
            )}
          </motion.span>
          <VisuallyHidden.Root id={tokensId}>
            {tokens.length > 0 ? words.filtering(tokens) : null}
          </VisuallyHidden.Root>
          <VisuallyHidden.Root role="status">{announced}</VisuallyHidden.Root>
        </motion.div>
      </Popover.Anchor>
      <Popover.Content
        align="start"
        role="presentation"
        className="bt-command-search-panel"
        style={panelWidth > 0 ? { inlineSize: `${String(panelWidth)}px` } : {}}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (
            event.target instanceof Node &&
            field.current?.contains(event.target) === true
          )
            event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (event.isComposing || composing.current || composed.current) {
            event.preventDefault();
            return;
          }
          if (current === "") return;
          event.preventDefault();
          update("");
        }}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
      >
        <div ref={scroller} data-bt-part="scroll">
          <div
            role="listbox"
            id={listboxId}
            aria-label={words.results}
            aria-owns={footerLink ? footerId : undefined}
            data-bt-part="groups"
          >
            {placed.map(({ group, rows: groupRows }) => (
              <div
                key={group.id}
                role="group"
                aria-label={group.label}
                data-bt-part="command-search-group"
              >
                <div
                  aria-hidden="true"
                  className="bt-text"
                  data-role="label"
                  data-bt-part="group-heading"
                >
                  {group.label}
                </div>
                {groupRows.map(({ id, option }) => renderOption(option, id))}
                {group.loading ? (
                  <div
                    role="option"
                    aria-disabled="true"
                    aria-selected="false"
                    data-bt-part="searching"
                  >
                    <span data-bt-part="spinner-slot">
                      <Spinner />
                    </span>
                    <span className="bt-text" data-role="body-sm">
                      {words.searching(group.label)}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {noResults ? (
            <div data-bt-part="command-search-empty">
              <Icon icon={Search} data-bt-part="empty-icon" />
              <p
                className="bt-text"
                data-role="label"
                data-bt-part="empty-title"
              >
                {words.noResults(
                  query.text.trim() === ""
                    ? tokens.join(" ")
                    : query.text.trim(),
                )}
              </p>
              {hasContent(emptyHint) ? (
                <p
                  className="bt-text"
                  data-role="body-sm"
                  data-bt-part="empty-hint"
                >
                  {emptyHint}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        {empty ? (
          filtersHref === undefined ? null : (
            <div data-bt-part="command-search-footer">
              <a
                href={filtersHref}
                {...footerProps(activeId === footerId)}
                onClick={() => {
                  finish(true);
                }}
              >
                {words.moreFilters}
              </a>
            </div>
          )
        ) : resultsHref === undefined && onSearch === undefined ? null : (
          <div data-bt-part="command-search-footer">
            <a
              ref={allResults}
              href={resultsHref?.(submitted) ?? "#"}
              {...footerProps(activeId === footerId)}
              onClick={(event) => {
                if (resultsHref === undefined) event.preventDefault();
                searchAll();
              }}
            >
              {words.allResults}
            </a>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
