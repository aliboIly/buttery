#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
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

const root = fileURLToPath(new URL("..", import.meta.url));
const starter = join(root, "apps/starter");
const target = join(starter, "src/examples-check");

/** What an example may import: buttery's packages, its icons, React, and nothing from the repo itself. */
const ALLOWED = /^(?:react|react-dom|@buttery\/(?:core|react)|@buttery\/core\/palettes|lucide-react)$/;

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit" });
}

/**
 * Pastes every example into the starter, as someone copying it from the docs would, then type-checks and
 * builds the starter with all of them, so each one works in a fresh app on its own. Fails on an example
 * that imports anything a fresh app doesn't have.
 */
export async function checkExamplesBuild() {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const problems = [];
  const files = globSync("packages/*/src/**/examples/*.tsx", { cwd: root }).sort();
  const imports = [];
  for (const [index, file] of files.entries()) {
    const source = readFileSync(join(root, file), "utf8");
    for (const [, specifier] of source.matchAll(/from "([^"]+)"/g)) {
      if (!ALLOWED.test(specifier ?? ""))
        problems.push(
          `${file} imports ${String(specifier)}, which a fresh app doesn't have. Fix: import it from @buttery/core or @buttery/react.`,
        );
    }
    const name = `example-${String(index)}-${basename(dirname(dirname(file)))}-${basename(file)}`;
    copyFileSync(join(root, file), join(target, name));
    imports.push(`import * as example${String(index)} from "./${name}";`);
  }
  writeFileSync(
    join(target, "index.ts"),
    `${imports.join("\n")}\n\nexport const examples = [${files
      .map((_, index) => `example${String(index)}`)
      .join(", ")}];\n`,
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
  else process.stdout.write("Every example builds when pasted into a fresh starter.\n");
}
