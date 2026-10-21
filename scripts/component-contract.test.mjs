import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { kebabCase } from "./new-component.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const KIND_FOLDERS = ["primitives", "layers", "components", "patterns"];

function componentFolders() {
  const found = [];
  for (const packageName of readdirSync(join(root, "packages"))) {
    for (const kindFolder of KIND_FOLDERS) {
      const base = join(root, "packages", packageName, "src", kindFolder);
      if (!existsSync(base)) continue;
      for (const entry of readdirSync(base, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const folder = join(base, entry.name);
        const source = readdirSync(folder).find(
          (file) =>
            /^[A-Z][A-Za-z0-9]*\.tsx$/.test(file) &&
            kebabCase(file.slice(0, -4)) === entry.name,
        );
        if (source)
          found.push({ packageName, folder, name: source.slice(0, -4) });
      }
    }
  }
  return found;
}

const folders = componentFolders();

/** The names a package's entry point exports, values and types alike. */
function exportedNames(packageName) {
  const index = readFileSync(
    join(root, "packages", packageName, "src", "index.ts"),
    "utf8",
  );
  const names = new Set();
  for (const [, list] of index.matchAll(
    /export\s+(?:type\s+)?\{([^}]*)\}\s+from/g,
  )) {
    for (const part of list.split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop();
      if (name) names.add(name);
    }
  }
  return names;
}

const PUBLIC = new Set(
  readdirSync(join(root, "packages"))
    .filter((packageName) =>
      existsSync(join(root, "packages", packageName, "src", "index.ts")),
    )
    .flatMap((packageName) => [...exportedNames(packageName)]),
);

/** Names a component takes from outside its own folder that no package exports, so a user couldn't build it. */
function privateImports(folder) {
  const found = [];
  const files = readdirSync(folder, { recursive: true })
    .map(String)
    .filter(
      (file) =>
        /\.tsx?$/.test(file) &&
        !/\.(test|meta|playground)\.tsx?$/.test(file) &&
        !file.startsWith(`examples${sep}`),
    );
  for (const file of files) {
    const path = join(folder, file);
    const source = readFileSync(path, "utf8");
    for (const [, list, from] of source.matchAll(
      /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"(\.[^"]+)"/g,
    )) {
      const target = resolve(dirname(path), from);
      if (target.startsWith(folder + sep)) continue;
      for (const part of list.split(",")) {
        const name = part
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0];
        if (name && !PUBLIC.has(name))
          found.push(`${name} from ${relative(root, target)}`);
      }
    }
  }
  return found;
}

/** Exported types, and members of exported interfaces, in `source` with no JSDoc comment right before them. */
function undocumentedMembers(source) {
  const missing = [];
  const lines = source.split("\n");
  let current = null;
  let depth = 0;
  for (const [index, line] of lines.entries()) {
    const exported = /^export (?:interface|type) (\w+)\b/.exec(line);
    if (exported && !lines[index - 1]?.trim().endsWith("*/"))
      missing.push(exported[1]);
    const declared = /^export interface (\w+)\b/.exec(line);
    if (declared) {
      current = declared[1];
      depth = 0;
    }
    if (!current) continue;
    const member = /^ {2}(?:readonly )?([\w"-]+)\??:/.exec(line);
    if (member && depth === 1 && !lines[index - 1]?.trim().endsWith("*/"))
      missing.push(`${current}.${member[1]}`);
    depth +=
      (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
    if (depth <= 0 && line.trim().startsWith("}")) current = null;
  }
  return missing;
}

describe("component contract", () => {
  it("finds the components", () => {
    expect(folders.length).toBeGreaterThan(0);
  });

  for (const { packageName, folder, name } of folders) {
    describe(name, () => {
      const read = (file) => readFileSync(join(folder, file), "utf8");

      it("stamps data-bt and documents the export", () => {
        const source = read(`${name}.tsx`);
        const folderSource = readdirSync(folder)
          .filter(
            (file) =>
              /\.tsx?$/.test(file) &&
              !/\.(test|meta|playground)\.tsx?$/.test(file),
          )
          .map((file) => read(file))
          .join("\n");
        expect(
          folderSource,
          `${name} must stamp data-bt="${name}" on its root element`,
        ).toMatch(new RegExp(`data-bt(?:"\\s*:\\s*|=|",\\s*)"${name}"`));
        expect(
          source,
          `${name} needs a JSDoc comment right before "export function ${name}" (or "export const ${name}:" for compound components)`,
        ).toMatch(
          new RegExp(`\\*/\\s*export (?:function ${name}[<(]|const ${name}: )`),
        );
      });

      it("documents its exported types and every prop", () => {
        const missing = readdirSync(folder)
          .filter(
            (file) =>
              /\.tsx?$/.test(file) &&
              !/\.(test|meta|playground)\.tsx?$/.test(file),
          )
          .flatMap((file) =>
            undocumentedMembers(read(file)).map((name) => `${file}: ${name}`),
          );
        expect(missing, `add a JSDoc comment to ${missing.join(", ")}`).toEqual(
          [],
        );
      });

      it("styles itself through its bt- class", () => {
        const className = `bt-${kebabCase(name)}`;
        const css = readdirSync(folder)
          .filter((file) => file.endsWith(".css"))
          .map((file) => read(file))
          .join("\n");
        expect(
          css,
          `${name}'s CSS: select .${className} instead of [data-bt="…"], so components composed with asChild keep both sets of styles`,
        ).not.toMatch(/\[data-bt="/);
        if (!css.includes(`.${className}`)) return;
        const sources = readdirSync(folder)
          .filter(
            (file) =>
              /\.tsx?$/.test(file) &&
              !/\.(test|meta|playground)\.tsx?$/.test(file),
          )
          .map((file) => read(file))
          .join("\n");
        expect(
          sources,
          `${name} must add the ${className} class to its root element, merged with className`,
        ).toMatch(new RegExp(`["\\s]${className}["\\s]`));
      });

      it("ships tests, a playground page and at least two examples", () => {
        expect(
          existsSync(join(folder, `${name}.test.tsx`)),
          `add ${name}.test.tsx`,
        ).toBe(true);
        expect(
          read(`${name}.playground.tsx`),
          `${name}.playground.tsx must export demos`,
        ).toMatch(/export const demos\b/);
        const examples = existsSync(join(folder, "examples"))
          ? readdirSync(join(folder, "examples")).filter((file) =>
              file.endsWith(".tsx"),
            )
          : [];
        expect(
          examples.length,
          `${name} needs 2–4 examples in examples/`,
        ).toBeGreaterThanOrEqual(2);
        expect(
          examples.length,
          `${name} has more than 4 examples`,
        ).toBeLessThanOrEqual(4);
        for (const example of examples) {
          const source = readFileSync(
            join(folder, "examples", example),
            "utf8",
          );
          const exported = source.match(/^export function /gm) ?? [];
          expect(
            exported.length,
            `examples/${example} must export exactly one component`,
          ).toBe(1);
          expect(
            source,
            `examples/${example} needs a one-line JSDoc before its export`,
          ).toMatch(/\*\/\s*export function /);
        }
      });

      it("has a complete manifest entry", async () => {
        const { meta } = await import(
          pathToFileURL(join(folder, `${name}.meta.ts`)).href
        );
        expect(meta.name).toBe(name);
        expect(meta.purpose.length, `${name}.meta.ts: purpose`).toBeGreaterThan(
          10,
        );
        expect(
          meta.useWhen.length,
          `${name}.meta.ts: list when to use it in useWhen`,
        ).toBeGreaterThan(0);
        expect(
          meta.avoidWhen.length,
          `${name}.meta.ts: list when not to use it in avoidWhen`,
        ).toBeGreaterThan(0);
        expect(
          meta.related.length,
          `${name}.meta.ts: name related components`,
        ).toBeGreaterThan(0);
        expect(
          meta.a11y.length,
          `${name}.meta.ts: describe keyboard and screen-reader behavior`,
        ).toBeGreaterThan(10);
      });

      it("uses only what a user can import", () => {
        const found = privateImports(folder);
        expect(
          found,
          `${name} uses helpers no package exports: ${found.join(", ")}. Fix: export them from the package's index.ts with JSDoc, so anyone can build a component the way buttery builds its own.`,
        ).toEqual([]);
      });

      it("is exported from its package", () => {
        const index = readFileSync(
          join(root, "packages", packageName, "src", "index.ts"),
          "utf8",
        );
        expect(
          index,
          `export ${name} from packages/${packageName}/src/index.ts`,
        ).toMatch(new RegExp(`export \\{[^}]*\\b${name}\\b[^}]*\\}`));
      });
    });
  }
});
