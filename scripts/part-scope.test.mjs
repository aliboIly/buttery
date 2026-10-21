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

/** Which component folders use each part name, read from `data-bt-part="…"` in their sources. */
const partUsers = new Map();
/** Folders whose components take content, a `ReactNode`, that can hold other components. */
const takesContent = new Set();
for (const file of sources) {
  const folder = basename(dirname(file));
  const text = readFileSync(file, "utf8");
  for (const [, name] of text.matchAll(/data-bt-part="([a-z0-9-]+)"/g)) {
    if (!partUsers.has(name)) partUsers.set(name, new Set());
    partUsers.get(name).add(folder);
  }
  if (/\bReactNode\b/.test(text)) takesContent.add(folder);
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
).filter((path) => takesContent.has(basename(dirname(path))));

describe("part scope", () => {
  it.each(stylesheets.map((path) => [relative(root, path), path]))(
    "%s styles only its own parts, not those of components in its content",
    (_name, path) => {
      const folder = basename(dirname(path));
      const leaks = [];
      for (const selector of selectorsOf(readFileSync(path, "utf8"))) {
        for (const part of descendantParts(selector)) {
          const others = [...(partUsers.get(part) ?? [])].filter(
            (user) => user !== folder,
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
