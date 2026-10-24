import {
  cpSync,
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { shownSource } from "../../../apps/docs/vite/example-source.ts";
import { PAGE_KINDS } from "../../mcp/src/scaffold.ts";
import {
  APP_FILES,
  TEMPLATE_NAMES,
  TEMPLATE_SOURCES,
  agentsFile,
  appManifest,
  readmeFile,
} from "../src/templates.ts";
import type { Versions } from "../src/templates.ts";

const DOCS = "https://aliboily.github.io/buttery";
const root = fileURLToPath(new URL("../../..", import.meta.url));
const dist = fileURLToPath(new URL("../dist", import.meta.url));

function json(path: string): object {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (typeof value !== "object" || value === null) {
    throw new Error(`${relative(root, path)} isn't a JSON object.`);
  }
  return value;
}

function catalog(): Record<string, string> {
  const text = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
  const block = /^catalog:\n((?: {2}.+\n)+)/m.exec(text)?.[1] ?? "";
  return Object.fromEntries(
    [...block.matchAll(/^ {2}"?([^":]+)"?: (.+)$/gm)].map((match) => [
      match[1] ?? "",
      (match[2] ?? "").trim(),
    ]),
  );
}

function strings(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function versions(): Versions {
  const own: unknown = Reflect.get(
    json(join(root, "packages/cli/package.json")),
    "version",
  );
  const rootManifest = json(join(root, "package.json"));
  const tools = {
    ...strings(Reflect.get(rootManifest, "dependencies")),
    ...strings(Reflect.get(rootManifest, "devDependencies")),
  };
  return {
    buttery: typeof own === "string" ? own : "0.0.0",
    catalog: catalog(),
    tools: Object.fromEntries(
      ["eslint", "stylelint", "typescript-eslint"].flatMap((name) => {
        const range = tools[name];
        return range === undefined ? [] : [[name, range]];
      }),
    ),
  };
}

function titleIn(folder: string): string {
  const title = /<title>([^<]+)<\/title>/.exec(
    readFileSync(join(folder, "index.html"), "utf8"),
  )?.[1];
  if (title === undefined)
    throw new Error(`${relative(root, folder)}/index.html has no <title>.`);
  return title;
}

const SKIPPED = new Set(["node_modules", ".tsbuild", "target", "dist"]);

function copyFolder(from: string, to: string): void {
  cpSync(from, to, {
    recursive: true,
    filter: (path) =>
      !relative(from, path)
        .split(sep)
        .some((part) => SKIPPED.has(part)),
  });
}

function buildTemplates(found: Versions): void {
  const skill = readFileSync(
    join(root, ".claude/skills/make-it-buttery/SKILL.md"),
    "utf8",
  );
  for (const name of TEMPLATE_NAMES) {
    const from = join(root, TEMPLATE_SOURCES[name]);
    const to = join(dist, "templates", name);
    for (const part of ["index.html", "public", "src", "e2e"]) {
      if (existsSync(join(from, part)))
        copyFolder(join(from, part), join(to, part));
    }
    rmSync(join(to, "src", "index.ts"), { force: true });
    const title = titleIn(from);
    const files: Record<string, string> = {
      ...APP_FILES,
      "package.json": `${JSON.stringify(appManifest(json(join(from, "package.json")), found), null, 2)}\n`,
      "AGENTS.md": agentsFile(title, DOCS),
      "README.md": readmeFile(title, name, DOCS),
      ".claude/skills/make-it-buttery/SKILL.md": skill,
    };
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(to, path)), { recursive: true });
      writeFileSync(join(to, path), text);
    }
    writeFileSync(
      join(to, "template.json"),
      `${JSON.stringify({ name, title }, null, 2)}\n`,
    );
  }
  copyFolder(
    join(root, "apps/starter/src-tauri"),
    join(dist, "desktop", "src-tauri"),
  );
}

function exampleFile(component: string, example: string): string {
  const [meta] = globSync(`packages/*/src/**/${component}.meta.ts`, {
    cwd: root,
  });
  if (meta === undefined)
    throw new Error(`No ${component}.meta.ts for its page.`);
  const file = join(root, dirname(meta), "examples", `${example}.tsx`);
  if (!existsSync(file))
    throw new Error(`${component} has no example called ${example}.`);
  return file;
}

function buildPages(): void {
  const pages: Record<
    string,
    { component: string; what: string; code: string }
  > = {};
  for (const [kind, [component, example, what]] of Object.entries(PAGE_KINDS)) {
    const file = exampleFile(component, example);
    pages[kind] = {
      component,
      what,
      code: shownSource(readFileSync(file, "utf8")),
    };
  }
  writeFileSync(
    join(dist, "pages.json"),
    `${JSON.stringify(pages, null, 2)}\n`,
  );
}

const found = versions();
rmSync(join(dist, "templates"), { recursive: true, force: true });
rmSync(join(dist, "desktop"), { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
buildTemplates(found);
buildPages();
writeFileSync(
  join(dist, "versions.json"),
  `${JSON.stringify(found, null, 2)}\n`,
);
process.stdout.write(
  `Built ${String(TEMPLATE_NAMES.length)} templates and ${String(Object.keys(PAGE_KINDS).length)} pages for buttery ${found.buttery}.\n`,
);
