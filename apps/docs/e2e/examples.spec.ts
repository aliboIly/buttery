import { existsSync, globSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { test } from "@playwright/test";
import { expectButtery } from "@butteryui/test";
import { componentRoute } from "../src/routes.ts";

const full = process.env["BUTTERY_MATRIX"] === "full";

/** Every component with examples, by its name and its lab page. */
const withExamples = globSync("packages/*/src/**/*.meta.ts")
  .filter((meta) => existsSync(join(dirname(meta), "examples")))
  .map((meta) => basename(meta, ".meta.ts"))
  .sort();

test.describe.configure({ timeout: 300_000 });

for (const name of withExamples) {
  test(`${name}'s examples are buttery in light, dark and compact`, async ({
    page,
  }) => {
    await page.goto(`/lab/examples/${componentRoute(name)}?chrome=0`);
    await expectButtery(page, {
      viewports: [{ width: 1280, height: 800 }],
      themes: full ? ["light", "dark"] : ["light"],
      densities: full ? ["comfortable", "compact"] : ["comfortable"],
      name: `${name} examples`,
    });
  });
}
