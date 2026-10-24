import { existsSync, globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// A name cut short at a template literal, such as `--bt-h-${size}`, isn't one.
const NAME = /--bt-[\w-]+/g;

function namesIn(files: readonly string[]): Set<string> {
  const names = new Set<string>();
  for (const file of files) {
    for (const [name] of readFileSync(file, "utf8").matchAll(NAME)) {
      if (!name.endsWith("-")) names.add(name);
    }
  }
  return names;
}

function installedFiles(root: string, name: string): readonly string[] {
  try {
    const folder = dirname(
      createRequire(join(root, "package.json")).resolve(`${name}/package.json`),
    );
    return globSync("dist/**/*.{css,js}", { cwd: folder }).map((file) =>
      join(folder, file),
    );
  } catch {
    return [];
  }
}

const SKIPPED =
  /(?:^|\/)(?:node_modules|dist|\.tsbuild|test-results|playwright-report|target|reference)(?:\/|$)/;

const DECLARED = /(--bt-[\w-]+)\s*:/g;

/** The `--bt-*` names a project's own files declare in CSS or write from script, such as inline styles. */
function projectNames(root: string): Set<string> {
  const names = new Set<string>();
  for (const file of globSync("**/*.{css,ts,tsx,js,jsx,mjs}", {
    cwd: root,
    exclude: (path) => SKIPPED.test(path),
  })) {
    const text = readFileSync(join(root, file), "utf8");
    const pattern = file.endsWith(".css") ? DECLARED : NAME;
    for (const match of text.matchAll(pattern)) {
      const name = match[1] ?? match[0];
      if (!name.endsWith("-")) names.add(name);
    }
  }
  return names;
}

const found = new Map<string, ReadonlySet<string> | null>();

/**
 * Every `--bt-*` name a `var()` may read in the project at `root`: what buttery declares, reads or sets from
 * script (this repository's package sources when `root` is buttery's repository, otherwise the
 * `@butteryui/core` and `@butteryui/react` builds `root` resolves), and what the project's own files declare
 * in CSS or write from script. Null when buttery can't be found, so nothing is checked.
 */
export function butteryNames(root: string): ReadonlySet<string> | null {
  const cached = found.get(root);
  if (cached !== undefined) return cached;
  const files = existsSync(join(root, "packages/core/src/tokens"))
    ? globSync("packages/*/src/**/*.{css,ts,tsx}", { cwd: root }).map((file) =>
        join(root, file),
      )
    : [
        ...installedFiles(root, "@butteryui/core"),
        ...installedFiles(root, "@butteryui/react"),
      ];
  const names =
    files.length === 0
      ? null
      : new Set([...namesIn(files), ...projectNames(root)]);
  found.set(root, names);
  return names;
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j] ?? 0;
      row[j] = Math.min(
        above + 1,
        (row[j - 1] ?? 0) + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return row[b.length] ?? 0;
}

/** Up to three of `names` nearest `name`, those that start the same way first. */
export function nearestNames(
  name: string,
  names: ReadonlySet<string>,
): readonly string[] {
  const family = name.split("-").slice(0, 4).join("-");
  const all = [...names];
  const pool = all.some((candidate) => candidate.startsWith(`${family}-`))
    ? all.filter((candidate) => candidate.startsWith(`${family}-`))
    : all;
  return pool
    .map((candidate) => ({ candidate, score: distance(name, candidate) }))
    .sort((a, b) => a.score - b.score || a.candidate.localeCompare(b.candidate))
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}
