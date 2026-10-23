import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { demoPages, templates } from "../apps/docs/src/routes.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

/** The files every template gives the app made from it, which a demo keeps as they are. */
const SHELL = [
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "src/main.tsx",
  "src/router.tsx",
];

function read(folder, file) {
  return readFileSync(join(root, folder, file), "utf8");
}

/** An app's name, as its `index.html` titles it. */
function titleOf(folder) {
  const title = /<title>([^<]+)<\/title>/.exec(read(folder, "index.html"))?.[1];
  if (title === undefined)
    throw new Error(`${folder}/index.html has no title.`);
  return title;
}

function folderOf(template) {
  const found = templates.find(({ name }) => name === template);
  if (!found) throw new Error(`There's no template called ${template}.`);
  return found.folder;
}

describe.each(demoPages)("the $route demo", ({ route, template }) => {
  const demo = `apps/demos/${route}`;
  const from = folderOf(template);

  it.each(SHELL)(
    `keeps the ${template} template's %s, apart from its name`,
    (file) => {
      const named = read(demo, file).replaceAll(titleOf(demo), titleOf(from));
      expect(named).toBe(read(from, file));
    },
  );

  it("keeps the template's package.json, apart from its name, its port and what it adds", () => {
    const own = JSON.parse(read(demo, "package.json"));
    const given = JSON.parse(read(from, "package.json"));
    expect(own.name).toBe(`demo-${route}`);
    expect(own.config.port).not.toBe(given.config.port);
    expect({
      ...own,
      name: given.name,
      config: given.config,
      dependencies: undefined,
    }).toEqual({
      ...given,
      dependencies: undefined,
    });
    expect(own.dependencies).toMatchObject(given.dependencies);
  });
});

describe("the dashboard template's page", () => {
  it("shows the overview screen's code as the template's file has it", () => {
    const page = readFileSync(
      join(root, "apps/docs/content/templates/dashboard.mdx"),
      "utf8",
    );
    const shown =
      /## The overview screen\n[\s\S]*?```tsx\n([\s\S]*?)\n```/.exec(page)?.[1];
    expect(shown).toBe(
      read(folderOf("dashboard"), "src/pages/OverviewPage.tsx").trimEnd(),
    );
  });
});
