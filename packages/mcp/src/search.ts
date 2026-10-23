import MiniSearch from "minisearch";
import {
  correctionFor,
  loadIndex,
  searchDocs,
  TEXT_OPTIONS,
  TITLE_OPTIONS,
} from "../../../apps/docs/src/search/search.ts";
import type {
  SearchHit,
  SearchIndexes,
} from "../../../apps/docs/src/search/search.ts";
import type { ComponentEntry, Knowledge, RuleEntry } from "./knowledge.ts";

/** What `buttery_search` can narrow its results to. */
export const SEARCH_KINDS = [
  "component",
  "pattern",
  "page",
  "guide",
  "token",
  "prop",
  "example",
  "rule",
] as const;

/** One of {@link SEARCH_KINDS}. */
export type SearchKind = (typeof SEARCH_KINDS)[number];

/** One result: the id `buttery_get` takes, what it is, and a line about it. */
export interface SearchItem {
  /** Such as `component/Dialog`, `page/layout/responsive#container-queries` or `tokens/space`. */
  readonly id: string;
  /** A component's kind (`component`, `pattern`, `primitive`, `layer`), or `page`, `section`, `token`, `prop`, `example`, `rule`, `check`, `release`. */
  readonly kind: string;
  readonly title: string;
  readonly summary: string;
}

/** A search's results, best first, and a nearby query when nothing matched. */
export interface SearchResults {
  readonly items: readonly SearchItem[];
  /** How many matched before `limit` cut the list. */
  readonly total: number;
  readonly correction: string | null;
}

/** Searches one knowledge bundle, loading its indexes on first use. */
export interface Searcher {
  search(query: string, kind: SearchKind | null, limit: number): SearchResults;
}

const COMPONENT_KINDS: ReadonlySet<string> = new Set([
  "component",
  "primitive",
  "layer",
]);

/**
 * How much more an agent wants each kind of result than the docs search ranks it: building UI starts from a
 * component or a pattern, so a prop or a token that merely shares a word with the query ranks below them.
 */
const AGENT_WEIGHT: Readonly<Record<string, number>> = {
  component: 2,
  primitive: 2,
  layer: 2,
  pattern: 2,
  page: 1.2,
  section: 1,
  prop: 0.5,
  example: 0.6,
  token: 0.5,
  release: 0.3,
};

function routeOf(href: string): string {
  return href.replace(/^\//, "");
}

function clip(text: string, length: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= length
    ? flat
    : `${flat.slice(0, length - 1).replace(/[\s.,;:]+$/, "")}…`;
}

function componentItem(component: ComponentEntry): SearchItem {
  const use = component.useWhen[0];
  return {
    id: `component/${component.name}`,
    kind: component.kind,
    title: component.name,
    summary: clip(
      use === undefined
        ? component.purpose
        : `${component.purpose} Use for: ${use}`,
      220,
    ),
  };
}

function keeps(kind: SearchKind | null, item: SearchItem): boolean {
  switch (kind) {
    case null:
      return true;
    case "component":
      return COMPONENT_KINDS.has(item.kind) || item.kind === "prop";
    case "pattern":
      return item.kind === "pattern";
    case "page":
      return item.kind === "page" || item.kind === "section";
    case "guide":
      return (
        (item.kind === "page" || item.kind === "section") &&
        /^page\/(?:guides|get-started)\//.test(item.id)
      );
    case "token":
      return item.kind === "token";
    case "prop":
      return item.kind === "prop";
    case "example":
      return item.kind === "example";
    case "rule":
      return item.kind === "rule" || item.kind === "check";
    default: {
      const unknownKind: never = kind;
      return unknownKind;
    }
  }
}

/** A searcher over `knowledge`: the docs site's index and ranking, with results named by `buttery_get` ids. */
export function createSearcher(knowledge: Knowledge): Searcher {
  const components = new Map(
    knowledge.components.map((component) => [component.name, component]),
  );
  const pages = new Map(knowledge.pages.map((page) => [page.route, page]));
  const tokens = new Map(
    knowledge.tokens.flatMap((group) =>
      group.tokens.map((token) => [token.cssVar, { group, token }] as const),
    ),
  );
  let indexes: SearchIndexes | null = null;
  let rules: MiniSearch<RuleEntry> | null = null;

  const docsIndexes = (): SearchIndexes => {
    indexes ??= {
      titles: loadIndex(knowledge.search.titles, TITLE_OPTIONS),
      text: loadIndex(knowledge.search.text, TEXT_OPTIONS),
    };
    return indexes;
  };

  const ruleIndex = (): MiniSearch<RuleEntry> => {
    if (rules === null) {
      rules = new MiniSearch<RuleEntry>({
        fields: ["title", "text"],
        storeFields: ["id"],
        searchOptions: { boost: { title: 4 }, prefix: true, fuzzy: 0.2 },
      });
      rules.addAll([...knowledge.rules]);
    }
    return rules;
  };

  const ruleItem = (rule: RuleEntry): SearchItem => ({
    id: rule.id,
    kind: rule.id.startsWith("check/") ? "check" : "rule",
    title: rule.title,
    summary: clip(rule.text, 220),
  });

  const itemOf = (hit: SearchHit): SearchItem | null => {
    const { entry } = hit;
    switch (entry.kind) {
      case "component": {
        const component = components.get(entry.title);
        return component ? componentItem(component) : null;
      }
      case "prop": {
        const owner = entry.path.at(-1) ?? "";
        const component = components.get(owner.split(".")[0] ?? "");
        if (!component) return null;
        const prop = component.props
          .flatMap((table) => table.props)
          .find((candidate) => candidate.name === entry.title);
        return {
          id: `component/${component.name}`,
          kind: "prop",
          title: `${owner}.${entry.title}`,
          summary: clip(prop?.description ?? hit.snippet, 220),
        };
      }
      case "example": {
        const name = /^example:([^/]+)\/(.+)\.tsx$/.exec(entry.id);
        const component = components.get(name?.[1] ?? "");
        const example = component?.examples.find(
          (candidate) => candidate.name === name?.[2],
        );
        if (!component || !example) return null;
        return {
          id: `example/${component.name}/${example.name}`,
          kind: "example",
          title: `${component.name}: ${example.title}`,
          summary: clip(example.caption, 220),
        };
      }
      case "page": {
        const page = pages.get(routeOf(entry.href));
        return {
          id: `page/${routeOf(entry.href)}`,
          kind: "page",
          title: entry.title,
          summary: clip(page?.description ?? hit.snippet, 220),
        };
      }
      case "heading":
      case "release":
        return {
          id: `page/${routeOf(entry.href)}`,
          kind: entry.kind === "heading" ? "section" : "release",
          title: [...entry.path.slice(1), entry.title].join(" › "),
          summary: clip(hit.snippet, 220),
        };
      case "token": {
        const found = tokens.get(entry.title);
        if (!found) return null;
        const values = Object.entries(found.token.values)
          .map(([field, value]) => `${field} ${value}`)
          .join(", ");
        return {
          id: `tokens/${found.group.name}`,
          kind: "token",
          title: entry.title,
          summary: clip(
            found.token.description === ""
              ? values
              : `${found.token.description} (${values})`,
            220,
          ),
        };
      }
      default: {
        const unknownKind: never = entry.kind;
        return unknownKind;
      }
    }
  };

  const listAll = (kind: SearchKind): SearchItem[] => {
    switch (kind) {
      case "component":
      case "pattern":
        return knowledge.components
          .filter((component) =>
            kind === "pattern"
              ? component.kind === "pattern"
              : component.kind !== "pattern",
          )
          .map((component) => componentItem(component));
      case "page":
      case "guide":
        return knowledge.pages
          .filter(
            (page) =>
              kind === "page" || /^(?:guides|get-started)\//.test(page.route),
          )
          .map((page) => ({
            id: `page/${page.route}`,
            kind: "page",
            title: page.title,
            summary: clip(page.description, 220),
          }));
      case "token":
        return knowledge.tokens.map((group) => ({
          id: `tokens/${group.name}`,
          kind: "token",
          title: group.name,
          summary: `${String(group.tokens.length)} tokens`,
        }));
      case "rule":
        return knowledge.rules.map(ruleItem);
      case "prop":
      case "example":
        return [];
      default: {
        const unknownKind: never = kind;
        return unknownKind;
      }
    }
  };

  return {
    search(query, kind, limit) {
      const text = query.trim();
      if (text === "") {
        const all = kind === null ? [] : listAll(kind);
        return {
          items: all.slice(0, limit),
          total: all.length,
          correction: null,
        };
      }
      const exact = text.toLowerCase();
      const ruleHits = ruleIndex()
        .search(text)
        .flatMap((result) => {
          const rule = knowledge.rules.find((entry) => entry.id === result.id);
          return rule ? [rule] : [];
        });
      const namedRules = ruleHits.filter(
        (rule) => rule.title.toLowerCase() === exact,
      );
      const found: SearchItem[] = [
        ...(kind === null ? namedRules.map(ruleItem) : []),
        ...(kind === "rule"
          ? ruleHits.map(ruleItem)
          : searchDocs(docsIndexes(), text, 200)
              .flatMap((hit) => {
                const item = itemOf(hit);
                if (!item) return [];
                const named =
                  (hit.entry.kind === "component" ||
                    hit.entry.kind === "page") &&
                  hit.entry.title.toLowerCase() === exact;
                return [
                  {
                    item,
                    named,
                    score: hit.score * (AGENT_WEIGHT[item.kind] ?? 1),
                  },
                ];
              })
              .sort(
                (a, b) =>
                  Number(b.named) - Number(a.named) || b.score - a.score,
              )
              .map(({ item }) => item)),
      ];
      const seen = new Set<string>();
      const items = found.filter((item) => {
        if (!keeps(kind, item)) return false;
        const key = item.kind === "prop" ? item.title : item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return {
        items: items.slice(0, limit),
        total: items.length,
        correction:
          items.length === 0
            ? (correctionFor(docsIndexes(), text) ?? null)
            : null,
      };
    },
  };
}
