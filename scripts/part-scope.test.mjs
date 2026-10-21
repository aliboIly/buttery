import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));

function filesUnder(folder, test) {
  const found = [];
  for (const entry of readdirSync(folder)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const path = join(folder, entry);
    if (statSync(path).isDirectory()) found.push(...filesUnder(path, test));
    else if (test(path)) found.push(path);
  }
  return found;
}

const sources = filesUnder(
  join(root, "packages"),
  (path) =>
    /\/src\/.+\.tsx$/.test(path) &&
    !/\.(test|playground)\.tsx$/.test(path) &&
    !path.includes("/examples/"),
);

/** A source's code with its comments and imports left out, so JSDoc examples and type imports don't count. */
function codeOf(file) {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^import [\s\S]*?from "[^"]+";$/gm, "");
}

/** Which component folders use each part name, read from `data-bt-part="…"` in their sources. */
const partUsers = new Map();
/** Folders whose components take content, a `ReactNode` or `ReactElement` prop, that can hold any component. */
const takesContent = new Set();
/** The folder each exported component lives in, so a JSX tag can be traced to its stylesheet's folder. */
const folderOf = new Map();
for (const file of sources) {
  const folder = basename(dirname(file));
  const code = codeOf(file);
  for (const [, name] of code.matchAll(/data-bt-part="([a-z0-9-]+)"/g)) {
    if (!partUsers.has(name)) partUsers.set(name, new Set());
    partUsers.get(name).add(folder);
  }
  const props = code.replace(/\)\s*:\s*React(?:Element|Node)\b/g, "");
  if (/\bReact(?:Element|Node)\b/.test(props)) takesContent.add(folder);
  for (const [, name] of code.matchAll(
    /^export (?:function|const) ([A-Z][A-Za-z0-9]*)/gm,
  ))
    folderOf.set(name, folder);
}

/** The other folders whose components each folder's JSX renders; `<Name` after a word character is a type argument. */
const renders = new Map();
for (const file of sources) {
  const folder = basename(dirname(file));
  if (!renders.has(folder)) renders.set(folder, new Set());
  for (const [, tag] of codeOf(file).matchAll(
    /(?<![\w$])<([A-Z][A-Za-z0-9]*)/g,
  )) {
    const used = folderOf.get(tag);
    if (used !== undefined && used !== folder) renders.get(folder).add(used);
  }
}

/** Every folder whose parts can end up inside a folder's component: anything, for one that takes content, else what it renders, followed through. */
function heldBy(folder, seen = new Set()) {
  for (const used of renders.get(folder) ?? []) {
    if (seen.has(used)) continue;
    seen.add(used);
    heldBy(used, seen);
  }
  return seen;
}

/** Each selector in a stylesheet, comments and at-rule preludes left out. */
function selectorsOf(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found = [];
  for (const [, prelude] of text.matchAll(/([^{}]+)\{/g)) {
    if (prelude.trim().startsWith("@")) continue;
    for (const selector of prelude.split(",")) {
      const clean = selector.replace(/\s+/g, " ").trim();
      if (clean !== "") found.push(clean);
    }
  }
  return found;
}

/**
 * The parts a selector reaches through a descendant combinator, which also match same-named parts of a
 * component nested in the content: `.bt-card [data-bt-part="title"]`, but not `.bt-card > [data-bt-part="title"]`.
 */
function descendantParts(selector) {
  const reached = [];
  for (const match of selector.matchAll(/\[data-bt-part="([a-z0-9-]+)"\]/g)) {
    const before = selector.slice(0, match.index);
    if (before.trim() === "" || !before.endsWith(" ")) continue;
    if (before.trimEnd().endsWith(">") || before.trimEnd().endsWith("+"))
      continue;
    reached.push(match[1]);
  }
  return reached;
}

const stylesheets = filesUnder(join(root, "packages"), (path) =>
  /\/src\/.+\.css$/.test(path),
);

describe("part scope", () => {
  it.each(stylesheets.map((path) => [relative(root, path), path]))(
    "%s styles only its own parts, not those of components in its content",
    (_name, path) => {
      const folder = basename(dirname(path));
      const held = heldBy(folder);
      const leaks = [];
      for (const selector of selectorsOf(readFileSync(path, "utf8"))) {
        for (const part of descendantParts(selector)) {
          const others = [...(partUsers.get(part) ?? [])].filter(
            (user) =>
              user !== folder && (takesContent.has(folder) || held.has(user)),
          );
          if (others.length > 0)
            leaks.push(
              `"${selector}" also reaches the ${part} part of ${others.join(", ")} when one sits inside it. Fix: reach it with a child combinator (> [data-bt-part="${part}"]) or give it a name of its own, such as "${folder}-${part}".`,
            );
        }
      }
      expect(leaks).toEqual([]);
    },
  );
});
