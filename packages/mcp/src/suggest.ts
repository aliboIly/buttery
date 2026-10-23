import type { Knowledge } from "./knowledge.ts";
import type { Searcher } from "./search.ts";

function distance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    let diagonal = previous[0] ?? 0;
    previous[0] = row;
    for (let column = 1; column <= b.length; column += 1) {
      const above = previous[column] ?? 0;
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      previous[column] = Math.min(
        above + 1,
        (previous[column - 1] ?? 0) + 1,
        diagonal + cost,
      );
      diagonal = above;
    }
  }
  return previous[b.length] ?? 0;
}

/** Every id `buttery_get` answers to, of the kind `prefix` names when it names one. */
function candidates(knowledge: Knowledge, prefix: string): string[] {
  const all = {
    component: knowledge.components.map(
      (component) => `component/${component.name}`,
    ),
    page: knowledge.pages.map((page) => `page/${page.route}`),
    tokens: knowledge.tokens.map((group) => `tokens/${group.name}`),
    rule: knowledge.rules.map((rule) => rule.id),
  };
  switch (prefix) {
    case "component":
    case "pattern":
    case "primitive":
    case "layer":
      return all.component;
    case "page":
      return all.page;
    case "tokens":
    case "token":
      return all.tokens;
    case "rule":
    case "check":
      return all.rule;
    default:
      return [...all.component, ...all.page, ...all.tokens, ...all.rule];
  }
}

function nameOf(id: string): string {
  return (id.split("/").at(-1) ?? id).toLowerCase().replace(/[-_\s]/g, "");
}

function sharedStart(a: string, b: string): number {
  let length = 0;
  while (length < a.length && a[length] === b[length]) length += 1;
  return length;
}

/**
 * The id meant by an id that names nothing, such as `component/Dialog` for `component/Dailog` or
 * `component/Modal`: the closest spelling, else the best search result for its last part.
 */
export function suggestionFor(
  knowledge: Knowledge,
  searcher: Searcher,
  id: string,
): string | null {
  const wanted = nameOf(id);
  if (wanted === "") return null;
  const slash = id.indexOf("/");
  const prefix = slash === -1 ? "" : id.slice(0, slash).toLowerCase();
  let best: { readonly id: string; readonly score: number } | null = null;
  for (const candidate of candidates(knowledge, prefix)) {
    const name = nameOf(candidate);
    // A shared start counts for more than a letter's difference later on, so "spacing" means "space".
    const score = distance(wanted, name) - 0.75 * sharedStart(wanted, name);
    if (best === null || score < best.score) best = { id: candidate, score };
  }
  if (
    best !== null &&
    best.score <= Math.max(1, Math.floor(wanted.length / 3))
  ) {
    return best.id;
  }
  const query = (id.split("/").at(-1) ?? id).replace(/[-_]/g, " ");
  const [kind] = id.split("/");
  const found = searcher.search(query, null, 10);
  const results =
    found.items.length === 0 && found.correction !== null
      ? searcher.search(found.correction, null, 10).items
      : found.items;
  return (
    results.find(
      (item) =>
        kind === "component" &&
        item.id.startsWith("component/") &&
        item.kind !== "prop",
    )?.id ??
    results[0]?.id ??
    null
  );
}
