import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
          new RegExp(`\\*/\\s*export (?:function ${name}\\(|const ${name}: )`),
        );
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
