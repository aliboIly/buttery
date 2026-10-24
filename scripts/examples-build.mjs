#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { shownSource } from "../apps/docs/vite/example-source.ts";
import {
  exportedName,
  pageCode,
  pageNames,
} from "../packages/mcp/src/page-code.ts";
import { PAGE_FRAMES, PAGE_KINDS } from "../packages/mcp/src/scaffold.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const starter = join(root, "apps/starter");
const target = join(starter, "src/examples-check");

/** What an example may import: buttery's packages, its icons, React, and nothing from the repo itself. */
const ALLOWED =
  /^(?:react|react-dom|@butteryui\/(?:core|react)|@butteryui\/core\/palettes|lucide-react)$/;

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit" });
}

/** Each page `buttery add page` and `buttery_scaffold` write, from its pattern's example, as `[kind, code]`. */
export function scaffoldedPages() {
  return Object.entries(PAGE_KINDS).map(
    ([kind, [component, example, what]]) => {
      const [meta] = globSync(`packages/*/src/**/${component}.meta.ts`, {
        cwd: root,
      });
      if (meta === undefined) throw new Error(`No ${component}.meta.ts.`);
      const source = shownSource(
        readFileSync(
          join(root, dirname(meta), "examples", `${example}.tsx`),
          "utf8",
        ),
      );
      const names = pageNames(exportedName(source));
      return [
        kind,
        pageCode(source, {
          frame: PAGE_FRAMES[kind],
          component: names.component,
          title: names.label,
          what,
        }),
      ];
    },
  );
}

/**
 * Pastes every example into the starter as the docs show it, as someone copying it from them would, and
 * every page the command line and the MCP server scaffold from them, then type-checks and builds the
 * starter with all of them, so each one works in a fresh app on its own. Fails on an example that imports
 * anything a fresh app doesn't have.
 */
export async function checkExamplesBuild() {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const problems = [];
  const files = globSync("packages/*/src/**/examples/*.tsx", {
    cwd: root,
  }).sort();
  const imports = [];
  for (const [index, file] of files.entries()) {
    const source = readFileSync(join(root, file), "utf8");
    for (const [, specifier] of source.matchAll(/from "([^"]+)"/g)) {
      if (!ALLOWED.test(specifier ?? ""))
        problems.push(
          `${file} imports ${String(specifier)}, which a fresh app doesn't have. Fix: import it from @butteryui/core or @butteryui/react.`,
        );
    }
    const name = `example-${String(index)}-${basename(dirname(dirname(file)))}-${basename(file)}`;
    writeFileSync(join(target, name), shownSource(source));
    imports.push(`import * as example${String(index)} from "./${name}";`);
  }
  const pages = scaffoldedPages();
  for (const [index, [kind, code]] of pages.entries()) {
    writeFileSync(join(target, `page-${kind}.tsx`), code);
    imports.push(`import * as page${String(index)} from "./page-${kind}.tsx";`);
  }
  writeFileSync(
    join(target, "index.ts"),
    `${imports.join("\n")}\n\nexport const examples = [${[
      ...files.map((_, index) => `example${String(index)}`),
      ...pages.map((_, index) => `page${String(index)}`),
    ].join(", ")}];\n`,
  );
  if (problems.length > 0) return problems;
  try {
    run("node", [
      "node_modules/typescript-native/bin/tsc",
      "-p",
      "apps/starter/tsconfig.json",
      "--noEmit",
    ]);
    await build({
      root: starter,
      configFile: join(starter, "vite.config.ts"),
      logLevel: "error",
      build: {
        outDir: join(target, "dist"),
        emptyOutDir: true,
        rollupOptions: { input: join(target, "index.ts") },
      },
    });
  } catch (error) {
    problems.push(
      `The starter didn't type-check or build with every example pasted in: ${String(error)}`,
    );
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
  return problems;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const problems = await checkExamplesBuild();
  for (const problem of problems) process.stderr.write(`${problem}\n`);
  if (problems.length > 0) process.exitCode = 1;
  else
    process.stdout.write(
      "Every example, and every page scaffolded from one, builds when pasted into a fresh starter.\n",
    );
}
