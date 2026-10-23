import { beforeAll, describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import type { Knowledge } from "./knowledge.ts";
import { createSearcher } from "./search.ts";
import type { Searcher } from "./search.ts";

/** What agents ask for when they build UI, and an id each should find in its top three. */
const AGENT_QUERIES: readonly (readonly [string, readonly string[]])[] = [
  ["modal", ["component/Dialog"]],
  ["popup", ["component/Popover", "component/Dialog"]],
  ["dropdown", ["component/Menu", "component/Select"]],
  ["drawer", ["component/Sheet"]],
  ["right-click menu", ["component/ContextMenu"]],
  ["toast notification", ["component/Toaster"]],
  ["spinner", ["component/LoadingPill"]],
  ["toggle between three views", ["component/SegmentedControl"]],
  [
    "settings page",
    [
      "component/SettingsIndex",
      "component/SettingsPage",
      "page/patterns/settings-pages",
    ],
  ],
  [
    "data table with sorting",
    ["component/DataTable", "page/patterns/data-table-page"],
  ],
  ["pricing page", ["component/PlanComparison"]],
  ["onboarding", ["component/Onboarding"]],
  ["sign in", ["component/SignInForm"]],
  ["login form", ["component/SignInForm"]],
  ["sign up", ["component/SignUpForm"]],
  ["empty state", ["component/EmptyState"]],
  ["tabs", ["component/Tabs"]],
  ["search box", ["component/SearchField"]],
  ["command palette", ["component/CommandSearch"]],
  ["breadcrumbs", ["component/Breadcrumbs"]],
  ["sidebar navigation", ["component/Sidebar"]],
  ["tooltip", ["component/Tooltip"]],
  ["product catalog", ["component/Catalog"]],
  ["faq", ["component/Faq"]],
  ["accordion", ["component/Accordion"]],
  ["slider", ["component/Slider"]],
  ["color picker", ["component/ColorPicker"]],
  ["text input", ["component/TextField"]],
  ["checkbox", ["component/Checkbox"]],
  ["select", ["component/Select"]],
  ["gap", ["component/Stack", "component/Inline", "component/Grid"]],
  ["--bt-space-4", ["tokens/space"]],
  ["overlap", ["check/overlap"]],
  ["wrapping", ["check/wrapping"]],
  ["dark mode", ["page/foundations/theming"]],
  ["reduced motion", ["page/motion/reduced-motion"]],
];

let knowledge: Knowledge;
let searcher: Searcher;

beforeAll(() => {
  knowledge = repoKnowledge();
  searcher = createSearcher(knowledge);
});

describe("buttery_search", () => {
  it.each(AGENT_QUERIES)(
    "finds what %j asks for in its top three",
    (query, wanted) => {
      const top = searcher
        .search(query, null, 3)
        .items.map((item) => item.id.split("#")[0]);
      expect(top.some((id) => wanted.includes(id ?? ""))).toBe(true);
    },
  );

  it("ranks a component above a prop or a token that shares the query's word", () => {
    const [first] = searcher.search("modal", null, 5).items;
    expect(first?.id).toBe("component/Dialog");
  });

  it("names every result with an id buttery_get takes", () => {
    for (const query of [
      "modal",
      "gap",
      "--bt-space-4",
      "overlap",
      "theming",
    ]) {
      for (const item of searcher.search(query, null, 25).items) {
        expect(item.id).toMatch(
          /^(?:component|example|page|tokens|rule|check)\//,
        );
      }
    }
  });

  it("keeps only the kind asked for", () => {
    const patterns = searcher.search("page", "pattern", 25).items;
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.every((item) => item.kind === "pattern")).toBe(true);
    const rules = searcher.search("overflow", "rule", 25).items;
    expect(rules.map((item) => item.id)).toContain("check/overflow");
    expect(rules.every((item) => /^(?:rule|check)\//.test(item.id))).toBe(true);
  });

  it("lists a whole kind for an empty query, and says how many there are past the limit", () => {
    const results = searcher.search("", "component", 5);
    expect(results.items).toHaveLength(5);
    expect(results.total).toBe(
      knowledge.components.filter((component) => component.kind !== "pattern")
        .length,
    );
    expect(searcher.search("", null, 5).items).toEqual([]);
  });

  it("suggests a nearby search for a typo that finds nothing", () => {
    const results = searcher.search("dailog", null, 8);
    expect(results.items).toEqual([]);
    expect(results.correction).toBe("dialog");
  });
});
