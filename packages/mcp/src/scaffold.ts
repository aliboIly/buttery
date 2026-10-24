import type { ComponentEntry, ExampleEntry, Knowledge } from "./knowledge.ts";
import { exportedName, pageCode, pageNames } from "./page-code.ts";
import type { PageFrame } from "./page-code.ts";

/** One of the pages `buttery_scaffold` starts. */
export type PageKind =
  | "table"
  | "detail"
  | "overview"
  | "settings"
  | "settings-index"
  | "catalog"
  | "plans"
  | "search-results"
  | "empty"
  | "feature-intro"
  | "sign-in"
  | "sign-up"
  | "onboarding"
  | "landing"
  | "article"
  | "faq";

/**
 * The pages `buttery_scaffold` starts, each from the example of its pattern that is a whole page and
 * compiles in a fresh app (`pnpm check:examples` builds every example in the starter): its component, its
 * example and what the page is for.
 */
export const PAGE_KINDS: Readonly<
  Record<PageKind, readonly [component: string, example: string, what: string]>
> = {
  table: [
    "DataTable",
    "orders-table",
    "a list of records in a table, with its header and actions",
  ],
  detail: [
    "DetailPage",
    "green-coffee-lot",
    "one record: its facts, its actions and what's linked to it",
  ],
  overview: [
    "MetricCard",
    "overview-metrics",
    "a dashboard's numbers for a period",
  ],
  settings: [
    "SettingsPage",
    "notification-preferences",
    "one group of settings, each in a row",
  ],
  "settings-index": [
    "SettingsIndex",
    "roastery-settings",
    "every group of settings, each opening its own page",
  ],
  catalog: [
    "CatalogPage",
    "categories",
    "items to browse and pick from, by category",
  ],
  plans: [
    "PlanComparison",
    "plans-page",
    "plans side by side, one recommended",
  ],
  "search-results": [
    "SearchResults",
    "paged-orders",
    "results of a search, paged",
  ],
  empty: [
    "EmptyState",
    "no-orders",
    "a page with nothing in it yet and the way to start",
  ],
  "feature-intro": [
    "FeatureIntro",
    "subscriptions-intro",
    "a feature someone hasn't turned on, and why to",
  ],
  "sign-in": [
    "AuthFlow",
    "shop-sign-in",
    "signing in or signing up with a code sent by email or text, no password",
  ],
  "sign-up": ["SignUpForm", "sign-up-page", "creating an account"],
  onboarding: [
    "Onboarding",
    "welcome-screen",
    "a first run that shows the way around",
  ],
  landing: ["Page", "landing-page", "a marketing page in bands"],
  article: ["ArticleLayout", "guide", "a long read with an aside"],
  faq: ["Faq", "coffee-page", "questions and answers"],
};

/**
 * How each kind's example becomes a page: as it is when it's a whole page already, inside an `AppPage`
 * in an app's shell, or in a section of a `Page` on a screen of its own.
 */
export const PAGE_FRAMES: Readonly<Record<PageKind, PageFrame>> = {
  table: "whole",
  detail: "whole",
  overview: "titled",
  settings: "whole",
  "settings-index": "titled",
  catalog: "whole",
  plans: "app-page",
  "search-results": "whole",
  empty: "whole",
  "feature-intro": "titled",
  "sign-in": "whole",
  "sign-up": "screen",
  onboarding: "screen",
  landing: "whole",
  article: "reading",
  faq: "reading",
};

/** Every page kind, in the order the tool lists them. */
export const PAGE_KIND_NAMES: readonly PageKind[] = Object.keys(
  PAGE_KINDS,
).filter((name): name is PageKind => name in PAGE_KINDS);

/** What to scaffold. */
export type ScaffoldRequest =
  { readonly kind: "page"; readonly page: PageKind } | { readonly kind: "app" };

/** A scaffold that can't be made as asked. */
export class ScaffoldRequestError extends Error {}

function pageSource(
  knowledge: Knowledge,
  page: PageKind,
): { component: ComponentEntry; example: ExampleEntry } {
  const [name, file] = PAGE_KINDS[page];
  const component = knowledge.components.find((entry) => entry.name === name);
  const example = component?.examples.find((entry) => entry.name === file);
  if (!component || !example) {
    throw new ScaffoldRequestError(
      `This version of buttery has no ${page} page to start from. Fix: build it from its pattern; buttery_search({"query":"${page} page","kind":"pattern"}) finds it.`,
    );
  }
  return { component, example };
}

/** The buttery components a file imports, in the order it imports them. */
export function importedComponents(code: string): string[] {
  return [
    ...code.matchAll(
      /import\s*\{([^}]*)\}\s*from\s*["']@butteryui\/(?:core|react)["']/g,
    ),
  ].flatMap((match) =>
    (match[1] ?? "")
      .split(",")
      .map((name) => name.trim().split(/\s+as\s+/)[0] ?? "")
      .filter((name) => /^[A-Z]/.test(name)),
  );
}

/** A scaffold as Markdown: the file to save, where, and what to do next. */
export function scaffold(
  knowledge: Knowledge,
  request: ScaffoldRequest,
): string {
  if (request.kind === "app") {
    const templates = knowledge.pages
      .filter((page) => page.route.startsWith("templates/"))
      .map(
        (page) =>
          `- ${page.route.replace("templates/", "")}: ${page.description}`,
      );
    return [
      `## A new app on buttery ${knowledge.version}`,
      "",
      "In any folder, start one from a template; it comes with the lint configs, Playwright specs, AGENTS.md and this MCP server in each agent's config:",
      "",
      "```bash",
      "npx create-buttery my-app --template dashboard",
      "cd my-app",
      "npm run dev",
      "```",
      "",
      "Templates:",
      ...templates,
      "",
      "In an app you have, `npx buttery init` adds the packages, imports the styles, wraps the app in ButteryProvider and sets up the lint configs and agent files. By hand:",
      "",
      "```bash",
      "npm install @butteryui/core @butteryui/react",
      "```",
      "",
      "```tsx",
      'import "@butteryui/core/styles.css";',
      'import "@butteryui/react/styles.css";',
      'import { ButteryProvider } from "@butteryui/react";',
      "",
      "export function Root() {",
      "  return <ButteryProvider><App /></ButteryProvider>;",
      "}",
      "```",
      "",
      "Inside buttery's repository, `pnpm new-app my-app --template dashboard` makes the same app in apps/my-app.",
      "",
      `Next: \`npx buttery add page table --name Orders\` or buttery_scaffold({"kind":"page","page":"table"}) for a first page. Docs: ${knowledge.site}/get-started/installation`,
    ].join("\n");
  }
  const { component, example } = pageSource(knowledge, request.page);
  const [, , what] = PAGE_KINDS[request.page];
  const names = pageNames(exportedName(example.code));
  const code = pageCode(example.code, {
    frame: PAGE_FRAMES[request.page],
    component: names.component,
    title: names.label,
    what,
  });
  const used = [...new Set(importedComponents(code))];
  return [
    `## A ${request.page} page on buttery ${knowledge.version}: ${what}`,
    "",
    `From ${component.name}'s example "${example.title.toLowerCase()}". Save it as ${names.file} and route to it. It compiles as it is in an app with @butteryui/core and @butteryui/react; its words and data are examples to replace with yours.`,
    "",
    "```tsx",
    code.trimEnd(),
    "```",
    "",
    `It's built from ${used.join(", ")}. Their props in one call: buttery_get(${JSON.stringify({ ids: used.map((entry) => `component/${entry}`) })})`,
    `Once it runs, check it: buttery_check_layout({"url":"http://localhost:5173/<its route>"})`,
  ].join("\n");
}
