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

function candidates(knowledge: Knowledge): string[] {
  return [
    ...knowledge.components.map((component) => `component/${component.name}`),
    ...knowledge.pages.map((page) => `page/${page.route}`),
    ...knowledge.tokens.map((group) => `tokens/${group.name}`),
    ...knowledge.rules.map((rule) => rule.id),
  ];
}

function nameOf(id: string): string {
  return (id.split("/").at(-1) ?? id).toLowerCase().replace(/[-_\s]/g, "");
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
  let best: { readonly id: string; readonly score: number } | null = null;
  for (const candidate of candidates(knowledge)) {
    const score = distance(wanted, nameOf(candidate));
    if (best === null || score < best.score) best = { id: candidate, score };
  }
  if (
    best !== null &&
    best.score <= Math.max(1, Math.floor(wanted.length / 4))
  ) {
    return best.id;
  }
  const query = (id.split("/").at(-1) ?? id).replace(/[-_]/g, " ");
  const [kind] = id.split("/");
  const results = searcher.search(query, null, 10).items;
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
