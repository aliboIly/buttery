import { existsSync, globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/** A name a stylesheet declares, as a property (`--bt-card-gap:`) or with `@property`. */
const DECLARED = /@property\s+(--bt-[\w-]+)|(--bt-[\w-]+)\s*:/g;

/** A name script writes anywhere but inside a `var()`, such as an inline style's key or `setProperty`'s name. */
const WRITTEN = /(?<!var\(\s*)--bt-[\w-]+/g;

const SKIPPED =
  /(?:^|\/)(?:node_modules|dist|\.tsbuild|test-results|playwright-report|target|reference)(?:\/|$)/;

/** Whether the project's name scan skips `path`, a path from the project's folder: builds, installs and reports. */
export function isSkipped(path: string): boolean {
  return SKIPPED.test(path.replaceAll("\\", "/"));
}

/** The `--bt-*` names `files` declare or write: declared in stylesheets, written in script. */
function namesIn(files: readonly string[]): Set<string> {
  const names = new Set<string>();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(
      file.endsWith(".css") ? DECLARED : WRITTEN,
    )) {
      const name = match[1] ?? match[2] ?? match[0];
      // A name cut short at a template literal, such as `--bt-h-${size}`, isn't one.
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

/** The project's own stylesheets and scripts, without its builds, installs, reports and tests. */
function projectFiles(root: string): readonly string[] {
  return globSync("**/*.{css,ts,tsx,js,jsx,mjs}", {
    cwd: root,
    exclude: (path) => isSkipped(path) || /\.test\.[jt]sx?$/.test(path),
  }).map((file) => join(root, file));
}

/**
 * The folder that decides which names a stylesheet at `file` may read: buttery's repository when `file` is
 * in it, else the nearest folder above it with a `package.json`, else `fallback`.
 */
export function projectRootOf(
  file: string | undefined,
  fallback: string,
): string {
  if (file === undefined) return fallback;
  let nearest: string | null = null;
  for (let folder = dirname(file); ; folder = dirname(folder)) {
    if (existsSync(join(folder, "packages/core/src/tokens"))) return folder;
    if (nearest === null && existsSync(join(folder, "package.json")))
      nearest = folder;
    if (dirname(folder) === folder) return nearest ?? fallback;
  }
}

const scans = new Map<
  string,
  { readonly names: ReadonlySet<string> | null; readonly at: number }
>();

/**
 * Every `--bt-*` name a `var()` may read in the project at `root`: what buttery declares in its stylesheets
 * or writes from script (this repository's sources when `root` is buttery's repository, else the
 * `@butteryui/core` and `@butteryui/react` builds `root` resolves), and what the project's own stylesheets
 * declare and its scripts write, such as an inline style. A `var()` reading a name doesn't make it one.
 * Null when buttery can't be found, so nothing is checked. A scan is kept for `maxAge` milliseconds.
 */
export function butteryNames(
  root: string,
  maxAge = 30_000,
): ReadonlySet<string> | null {
  const scan = scans.get(root);
  if (scan !== undefined && performance.now() - scan.at < maxAge)
    return scan.names;
  const repository = existsSync(join(root, "packages/core/src/tokens"));
  const installed = repository
    ? []
    : [
        ...installedFiles(root, "@butteryui/core"),
        ...installedFiles(root, "@butteryui/react"),
      ];
  const names =
    repository || installed.length > 0
      ? namesIn([...installed, ...projectFiles(root)])
      : null;
  scans.set(root, { names, at: performance.now() });
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
