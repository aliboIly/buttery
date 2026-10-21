#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

const PRIVATE_PATHS = ["reference", "notes", "PROMPTS.md"];

/**
 * The reference products' names, one per line, kept inside the untracked reference folder so the repo
 * never spells them out. Without the file (a fresh clone, CI) the name scan is skipped.
 */
const NAMES_FILE = "reference/.private-names";

const BINARY = /\.(?:png|jpe?g|gif|webp|ico|icns|woff2?|ttf|otf|mov|mp4|zip)$/i;

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Reads the names file: one name per line, `#` starting a comment. */
export function parseNames(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/#.*/, "").trim())
    .filter(Boolean);
}

/**
 * Where `text` names one of `names`: each as a whole word, as written or plural, such as `Acme` and
 * `Acmes` but not `acme` or `Acmeville`. Returns the 1-based line and the name found.
 */
export function findNames(text, names) {
  if (names.length === 0) return [];
  const pattern = new RegExp(`\\b(?:${names.map(escape).join("|")})s?\\b`, "g");
  const found = [];
  for (const [index, line] of text.split("\n").entries()) {
    for (const match of line.matchAll(pattern))
      found.push({ line: index + 1, name: match[0] });
  }
  return found;
}

function trackedPrivatePaths() {
  return execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--", ...PRIVATE_PATHS],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
}

function trackedNames(names) {
  const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter((path) => path !== "" && !BINARY.test(path) && existsSync(path));
  return files.flatMap((path) =>
    findNames(readFileSync(path, "utf8"), names).map(
      (found) => `  ${path}:${String(found.line)}: ${found.name}`,
    ),
  );
}

function main() {
  const tracked = trackedPrivatePaths();
  if (tracked.length > 0) {
    process.stderr.write(
      [
        "These files are private build material and must never be tracked:",
        ...tracked.map((path) => `  ${path}`),
        `Fix: git rm -r --cached ${PRIVATE_PATHS.join(" ")}`,
        "",
      ].join("\n"),
    );
    return 1;
  }
  if (!existsSync(NAMES_FILE)) return 0;
  const named = trackedNames(parseNames(readFileSync(NAMES_FILE, "utf8")));
  if (named.length === 0) return 0;
  process.stderr.write(
    [
      "These tracked files name a reference product:",
      ...named,
      "Fix: describe the pattern in buttery's own words and rename what's named after the product.",
      "",
    ].join("\n"),
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main();
}
