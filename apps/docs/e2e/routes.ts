import { globSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { componentRoute, demoPages } from "../src/routes.ts";

/** A component's page metadata, read from the `page` its `*.playground.tsx` exports. */
function pageOf(meta: string): {
  readonly root: string;
  readonly home?: string;
} {
  const playground = meta.replace(/\.meta\.ts$/, ".playground.tsx");
  const source = readFileSync(playground, "utf8");
  const section = /section:\s*"([^"]+)"/.exec(source)?.[1];
  if (!section) throw new Error(`${playground} has no page section.`);
  const home = /home:\s*"([^"]+)"/.exec(source)?.[1];
  return {
    root: section.split("/")[0] ?? section,
    ...(home === undefined ? {} : { home }),
  };
}

/**
 * Every component with a page of its own, read from the meta files that create the pages, with its path.
 * Components whose home is a written page show there instead.
 */
export const componentRoutes: readonly {
  readonly name: string;
  readonly route: string;
}[] = globSync("packages/*/src/**/*.meta.ts")
  .map((path) => ({ name: basename(path, ".meta.ts"), page: pageOf(path) }))
  .filter(({ page }) => page.home === undefined)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(({ name, page }) => ({
    name,
    route: `${page.root}/${componentRoute(name)}`,
  }));

/** Every written page's path and title, read from the MDX files under `apps/docs/content`. */
export const contentRoutes: readonly {
  readonly route: string;
  readonly title: string;
}[] = globSync("apps/docs/content/**/*.mdx")
  .map((path) => ({
    route: path.replace(/^apps\/docs\/content\//, "").replace(/\.mdx$/, ""),
    title:
      /^title:\s*(.+)$/m.exec(readFileSync(path, "utf8"))?.[1]?.trim() ?? "",
  }))
  .sort((a, b) => a.route.localeCompare(b.route));

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
  ...contentRoutes.map((page) => page.route),
  ...demoPages.map((page) => `demos/${page.route}`),
  ...componentRoutes.map(({ route }) => route),
];
