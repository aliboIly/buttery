import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readJson } from "./project.ts";

/** The packages buttery releases together, at one version. */
export const BUTTERY_PACKAGES: readonly string[] = [
  "@butteryui/core",
  "@butteryui/react",
  "@butteryui/test",
  "@butteryui/lint",
  "@butteryui/mcp",
  "@butteryui/cli",
];

/** The style sheets an app imports once, at its entry, in this order. */
export const STYLE_IMPORTS: readonly string[] = [
  "@butteryui/core/styles.css",
  "@butteryui/react/styles.css",
];

const ENTRIES = [
  "src/main.tsx",
  "src/main.jsx",
  "src/index.tsx",
  "src/index.jsx",
  "src/main.ts",
  "src/main.js",
];

/** The app's entry module, such as `src/main.tsx`: the module `index.html` loads, or a usual name. */
export function entryFile(root: string): string | null {
  const html = join(root, "index.html");
  if (existsSync(html)) {
    const source = /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/.exec(
      readFileSync(html, "utf8"),
    )?.[1];
    const file = source?.replace(/^\//, "");
    if (file !== undefined && existsSync(join(root, file))) return file;
  }
  return ENTRIES.find((file) => existsSync(join(root, file))) ?? null;
}

/**
 * The version of `name` in the nearest `node_modules` at or above `root`, where the app's bundler finds it,
 * or null when it isn't installed.
 */
export function installedVersion(root: string, name: string): string | null {
  let folder = root;
  for (;;) {
    const file = join(folder, "node_modules", name, "package.json");
    if (existsSync(file)) {
      const version = readJson(file)["version"];
      return typeof version === "string" ? version : null;
    }
    const parent = dirname(folder);
    if (parent === folder) return null;
    folder = parent;
  }
}

const BUILT =
  /(?:^|\/)(?:node_modules|dist|test-results|playwright-report|src-tauri)(?:\/|$)/;

/**
 * Every module an HTML page of the app loads as its entry, such as `src/main.tsx` for `index.html` and a
 * component's preview script for its preview page, each of which imports the styles itself.
 */
export function htmlEntries(root: string): ReadonlySet<string> {
  const entries = new Set<string>();
  for (const page of globSync("**/*.html", {
    cwd: root,
    exclude: (path) => BUILT.test(path),
  })) {
    const html = readFileSync(join(root, page), "utf8");
    for (const match of html.matchAll(
      /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/g,
    )) {
      const source = match[1] ?? "";
      if (/^[a-z]+:/i.test(source)) continue;
      entries.add(
        source.startsWith("/")
          ? source.slice(1)
          : join(dirname(page), source).replaceAll("\\", "/"),
      );
    }
  }
  return entries;
}

/** Every dependency the app's `package.json` lists, of any kind. */
export function listedDependencies(root: string): ReadonlySet<string> {
  const manifest = readJson(join(root, "package.json"));
  return new Set(
    ["dependencies", "devDependencies", "peerDependencies"].flatMap((field) => {
      const listed = manifest[field];
      return typeof listed === "object" && listed !== null
        ? Object.keys(listed)
        : [];
    }),
  );
}

/** The app's source files that could import a style sheet or render the provider. */
export function sourceFiles(root: string): readonly string[] {
  return globSync("src/**/*.{ts,tsx,js,jsx,css}", {
    cwd: root,
    exclude: (path) => path.includes("node_modules"),
  }).sort();
}

/** The first of `names` that exists in the app's folder, such as its ESLint config. */
export function firstExisting(
  root: string,
  names: readonly string[],
): string | null {
  return names.find((name) => existsSync(join(root, name))) ?? null;
}

/** ESLint's flat config files, in the order ESLint looks for them. */
export const ESLINT_CONFIGS: readonly string[] = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
];

/** stylelint's config files. */
export const STYLELINT_CONFIGS: readonly string[] = [
  "stylelint.config.mjs",
  "stylelint.config.js",
  "stylelint.config.cjs",
  ".stylelintrc.json",
  ".stylelintrc",
];
