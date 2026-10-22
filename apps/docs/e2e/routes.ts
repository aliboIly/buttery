import { globSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { componentRoute, demoPages, referencePages } from "../src/routes.ts";

/** A component's section, read from the `page` its `*.playground.tsx` exports. */
function sectionOf(meta: string): string {
  const playground = meta.replace(/\.meta\.ts$/, ".playground.tsx");
  const found = /section:\s*"([^"]+)"/.exec(readFileSync(playground, "utf8"));
  if (!found?.[1]) throw new Error(`${playground} has no page section.`);
  return found[1].split("/")[0] ?? found[1];
}

/** Every component with a page, read from the meta files that create the pages, with its path. */
export const componentRoutes: readonly {
  readonly name: string;
  readonly route: string;
}[] = globSync("packages/*/src/**/*.meta.ts")
  .map((path) => ({ path, name: basename(path, ".meta.ts") }))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(({ path, name }) => ({
    name,
    route: `${sectionOf(path)}/${componentRoute(name)}`,
  }));

const ROOTS = [
  "get-started",
  "foundations",
  "layout",
  "motion",
  "components",
  "patterns",
  "templates",
  "guides",
  "tools",
  "resources",
  "demos",
  "lab",
];

/**
 * A page's URL with `settings` added to its query. `route` is a path (`foundations/tokens`), a demo's own path
 * (`roastery/search?q=decaf`, under `/demos/`) or a component's name in kebab case (`fit-box`).
 */
export function url(route: string, settings = ""): string {
  const [name = "", query = ""] = route.split("?");
  const first = name.split("/")[0] ?? "";
  const path = ROOTS.includes(first)
    ? name
    : demoPages.some((page) => page.route === first)
      ? `demos/${name}`
      : (componentRoutes.find(({ route: path }) => path.endsWith(`/${name}`))
          ?.route ?? name);
  const search = [query, settings].filter((part) => part !== "").join("&");
  return `/${path}${search === "" ? "" : `?${search}`}`;
}

/** Every page's path, read from the files that create them. */
export const routes: readonly string[] = [
  ...referencePages.map((page) => page.route),
  ...demoPages.map((page) => `demos/${page.route}`),
  ...componentRoutes.map(({ route }) => route),
];
