import { globSync } from "node:fs";
import { basename } from "node:path";
import { componentRoute, foundationPages } from "../src/routes.ts";

const componentNames = globSync("packages/*/src/**/*.meta.ts").map((path) =>
  basename(path, ".meta.ts"),
);

/** Every playground route, read from the files that create them. */
export const routes: readonly string[] = [
  ...foundationPages.map((page) => page.route),
  ...componentNames.map((name) => componentRoute(name)).sort(),
];
