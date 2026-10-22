import type { IconComponentProps } from "@buttery/core";
import type { ComponentType, ReactNode } from "react";

/** A filter people can type into a `CommandSearch` as `key:value`. */
export interface SearchFilter {
  /** What they type before the colon, such as `"status"`. */
  readonly key: string;
  /** What it narrows by, shown at the end of its suggestion, such as "where an order has got to". */
  readonly description: string;
  /** A value shown after the key while nothing is typed, such as `"shipped"`. */
  readonly example: string;
  /** The values it takes, suggested as people type after the colon. Leave it out for free values. */
  readonly values?: readonly string[] | undefined;
}

/** A finished `key:value` filter, shown as a chip in the field. */
export interface SearchToken {
  /** The filter's key. */
  readonly key: string;
  /** What it's set to. */
  readonly value: string;
}

/** What someone is searching for: their words and the filters they've finished. */
export interface SearchQuery {
  /** The words in the field, without the finished filters. */
  readonly text: string;
  /** The finished filters, in the order they were typed. */
  readonly filters: readonly SearchToken[];
}

/** One result in a `CommandSearch` group or on a `SearchResults` page. */
export interface SearchItem {
  /** Identifies it within its source. */
  readonly id: string;
  /** Its words, with the characters that match the search highlighted. */
  readonly label: string;
  /** Where it sits, shown before the label with a chevron after each part, such as `["Settings"]`. */
  readonly path?: readonly string[] | undefined;
  /** A short line after the label in `text-secondary`, such as a handle or an order's total. */
  readonly detail?: string | undefined;
  /** An icon before it, such as `CircleHelp` for a help article. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** A small element before it in place of an icon, such as a 20px `Avatar`. */
  readonly media?: ReactNode;
  /** Where choosing it goes. */
  readonly href?: string | undefined;
  /** What choosing it does, as well as going to `href` when there's one. */
  readonly onSelect?: (() => void) | undefined;
}

interface SearchSourceBase {
  /** Identifies it among the sources. */
  readonly id: string;
  /** Its group's heading, such as `"Orders"`. */
  readonly label: string;
  /** How many results its group shows in the panel, at most. Defaults to `5`. */
  readonly limit?: number | undefined;
  /** Draws one of its results in place of the standard row. */
  readonly renderItem?:
    ((item: SearchItem, query: SearchQuery) => ReactNode) | undefined;
}

/** A source that answers from what the app already holds: its group changes in the frame the query does. */
export interface LocalSearchSource extends SearchSourceBase {
  /** Leave it out, or `false`, for a source that answers at once. */
  readonly remote?: false | undefined;
  /** Finds what matches the query. */
  readonly search: (query: SearchQuery) => readonly SearchItem[];
}

/**
 * A source that asks a server: it's asked 120ms after typing stops, its group keeps its last results until
 * new ones arrive, and a spinner row shows in its group meanwhile.
 */
export interface RemoteSearchSource extends SearchSourceBase {
  /** `true`: it answers later. */
  readonly remote: true;
  /** Finds what matches the query; `signal` aborts once the query has moved on. */
  readonly search: (
    query: SearchQuery,
    signal: AbortSignal,
  ) => Promise<readonly SearchItem[]>;
}

/** Where a `CommandSearch` looks: one group in its panel, and one section on a `SearchResults` page. */
export type SearchSource = LocalSearchSource | RemoteSearchSource;

/** A page a `pageSource` can go to. */
export interface SearchPage {
  /** Its name, such as `"Team notifications"`. */
  readonly label: string;
  /** Where it is. */
  readonly href: string;
  /** The sections it sits in, such as `["Settings"]`. */
  readonly path?: readonly string[] | undefined;
  /** Its icon, as the navigation shows it. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
}

/** Options for `pageSource`. */
export interface PageSourceOptions {
  /** The pages, such as the app's navigation flattened. */
  readonly pages: readonly SearchPage[];
  /** Identifies the source. Defaults to `"pages"`. */
  readonly id?: string | undefined;
  /** Its group's heading. Defaults to `"Go to"`. */
  readonly label?: string | undefined;
  /** How many pages its group shows in the panel. Defaults to `5`. */
  readonly limit?: number | undefined;
}

const FINISHED_TOKEN = /(^|\s+)([^\s:]+):(\S+)(?=\s)/g;

function wordsOf(text: string): readonly string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Whether every word of `text` appears somewhere in `fields`, ignoring case: how the built-in sources match.
 *
 * @example
 * matchesSearch("team not", "Team notifications", "Settings") // true
 */
export function matchesSearch(
  text: string,
  ...fields: readonly (string | undefined)[]
): boolean {
  const words = wordsOf(text);
  if (words.length === 0) return false;
  const haystack = fields.join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/**
 * Where the words of `text` appear in `label`, ignoring case, as `[start, end)` ranges in order, merged where
 * they touch or overlap: what `CommandSearch` highlights.
 *
 * @example
 * matchRanges("Risk controls", "is") // [[1, 3]]
 */
export function matchRanges(
  label: string,
  text: string,
): readonly (readonly [number, number])[] {
  const lower = label.toLowerCase();
  const found: [number, number][] = [];
  for (const word of wordsOf(text)) {
    for (
      let at = lower.indexOf(word);
      at !== -1;
      at = lower.indexOf(word, at + word.length)
    ) {
      found.push([at, at + word.length]);
    }
  }
  found.sort((first, second) => first[0] - second[0]);
  const merged: [number, number][] = [];
  for (const range of found) {
    const last = merged.at(-1);
    if (last !== undefined && range[0] <= last[1])
      last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

/** Options for `parseSearch`. */
export interface ParseSearchOptions {
  /**
   * Whether the search has been sent, as a results page's address holds it: a filter at the very end counts as
   * finished too. Defaults to `false`, for a field someone is still typing in.
   */
  readonly sent?: boolean | undefined;
}

/**
 * Reads what's in a `CommandSearch` field into its finished filters and its words. A `key:value` whose key is
 * one of `filters` is finished once a space follows it; until then it's still being typed. A sent search
 * (`{ sent: true }`), such as the `q` of a results page, finishes the last one too.
 *
 * @example
 * parseSearch("status:shipped decaf", filters) // { filters: [{ key: "status", value: "shipped" }], text: "decaf" }
 * parseSearch("decaf status:shipped", filters, { sent: true }) // { filters: [{ key: "status", value: "shipped" }], text: "decaf" }
 */
export function parseSearch(
  value: string,
  filters: readonly SearchFilter[],
  { sent = false }: ParseSearchOptions = {},
): SearchQuery {
  if (sent) {
    const query = parseSearch(`${value} `, filters);
    return { ...query, text: query.text.trimEnd() };
  }
  const keys = new Map(
    filters.map((filter) => [filter.key.toLowerCase(), filter.key]),
  );
  const tokens: SearchToken[] = [];
  const text = value.replace(
    FINISHED_TOKEN,
    (whole, _lead: string, key: string, tokenValue: string) => {
      const known = keys.get(key.toLowerCase());
      if (known === undefined) return whole;
      tokens.push({ key: known, value: tokenValue });
      return "";
    },
  );
  return { text: text.trimStart(), filters: tokens };
}

/**
 * Writes a query back as the text a `CommandSearch` holds: each finished filter followed by a space, then the
 * words. `parseSearch` reads it back as the same query.
 *
 * @example
 * formatSearch({ text: "decaf", filters: [{ key: "status", value: "shipped" }] }) // "status:shipped decaf"
 */
export function formatSearch(query: SearchQuery): string {
  return `${query.filters.map((token) => `${token.key}:${token.value} `).join("")}${query.text}`;
}

/**
 * A source for the app's pages, matched by their names and the sections they sit in. Its results show their
 * path before their name. It finds nothing while the search has filters, which pages don't take.
 *
 * @example
 * const pages = pageSource({ pages: [{ label: "Team notifications", path: ["Settings"], href: "/settings/team" }] });
 */
export function pageSource({
  pages,
  id = "pages",
  label = "Go to",
  limit,
}: PageSourceOptions): LocalSearchSource {
  return {
    id,
    label,
    limit,
    search: (query) =>
      query.filters.length > 0
        ? []
        : pages
            .filter((page) =>
              matchesSearch(query.text, page.label, ...(page.path ?? [])),
            )
            .map((page) => ({
              id: page.href,
              label: page.label,
              path: page.path,
              icon: page.icon,
              href: page.href,
            })),
  };
}
