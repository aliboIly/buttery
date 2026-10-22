import { globSync } from "node:fs";
import { basename } from "node:path";
import { componentRoute, demoPages, foundationPages } from "../src/routes.ts";

/** Every component with a playground page, read from the meta files that create the pages. */
export const componentRoutes: readonly {
  readonly name: string;
  readonly route: string;
}[] = globSync("packages/*/src/**/*.meta.ts")
  .map((path) => basename(path, ".meta.ts"))
  .sort()
  .map((name) => ({ name, route: componentRoute(name) }));

/**
 * A page's URL from its short route, with any query it carries and `settings` after it: `button` is
 * `/components/button`, `tokens` `/foundations/tokens`, `roastery/search?q=decaf` `/demos/roastery/search?q=decaf`.
 */
export function url(route: string, settings = ""): string {
  const [name = "", query = ""] = route.split("?");
  const first = name.split("/")[0] ?? "";
  const section = foundationPages.some((page) => page.route === first)
    ? "foundations"
    : demoPages.some((page) => page.route === first)
      ? "demos"
      : "components";
  const search = [query, settings].filter((part) => part !== "").join("&");
  return `/${section}/${name}${search === "" ? "" : `?${search}`}`;
}

/** Every page's short route, read from the files that create them. */
export const routes: readonly string[] = [
  ...foundationPages.map((page) => page.route),
  ...demoPages.map((page) => page.route),
  ...componentRoutes.map(({ route }) => route),
];
