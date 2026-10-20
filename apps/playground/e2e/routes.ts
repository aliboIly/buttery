import { globSync } from "node:fs";
import { basename } from "node:path";
import { componentRoute, foundationPages } from "../src/routes.ts";

/** Every component with a playground page, read from the meta files that create the pages. */
export const componentRoutes: readonly {
  readonly name: string;
  readonly route: string;
}[] = globSync("packages/*/src/**/*.meta.ts")
  .map((path) => basename(path, ".meta.ts"))
  .sort()
  .map((name) => ({ name, route: componentRoute(name) }));

/** Every playground route, read from the files that create them. */
export const routes: readonly string[] = [
  ...foundationPages.map((page) => page.route),
  ...componentRoutes.map(({ route }) => route),
];
