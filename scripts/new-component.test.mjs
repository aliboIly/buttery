import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check } from "prettier";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkDocs } from "./docs-check.mjs";
import { createComponent, kebabCase } from "./new-component.mjs";

let root;

function write(path, content) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), content);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "buttery-new-component-"));
  write("packages/core/src/index.ts", 'export { cx } from "./utils/cx.ts";\n');
  write("packages/core/src/styles/index.css", '@import "./reset.css";\n');
  write("packages/react/src/index.ts", "");
  write("apps/docs/src/routes.ts", 'export const DOCS_VERSION = "0.9.0";\n');
  write(
    "packages/react/package.json",
    JSON.stringify({
      name: "@butteryui/react",
      exports: {
        ".": { default: "./dist/index.js" },
        "./package.json": "./package.json",
      },
    }),
  );
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("kebabCase", () => {
  it("splits PascalCase names, including acronyms", () => {
    expect(kebabCase("SegmentedControl")).toBe("segmented-control");
    expect(kebabCase("FitBox")).toBe("fit-box");
    expect(kebabCase("HTMLPreview")).toBe("html-preview");
  });
});

describe("createComponent", () => {
  it("scaffolds every contract file for a react component and wires it in", async () => {
    const written = await createComponent({
      root,
      name: "ValueBadge",
      purpose: "Shows a slider's value next to its label",
    });
    expect(written.sort()).toEqual(
      [
        "packages/react/src/components/value-badge/ValueBadge.meta.ts",
        "packages/react/src/components/value-badge/ValueBadge.playground.tsx",
        "packages/react/src/components/value-badge/ValueBadge.test.tsx",
        "packages/react/src/components/value-badge/ValueBadge.tsx",
        "packages/react/src/components/value-badge/examples/basic.tsx",
        "packages/react/src/components/value-badge/examples/composition.tsx",
        "packages/react/src/components/value-badge/value-badge.css",
      ].sort(),
    );
    const source = readFileSync(
      join(root, "packages/react/src/components/value-badge/ValueBadge.tsx"),
      "utf8",
    );
    expect(source).toContain('data-bt="ValueBadge"');
    expect(source).toContain('cx("bt-value-badge", className)');
    expect(source).toContain("* Shows a slider's value next to its label.");
    expect(
      readFileSync(join(root, "packages/react/src/index.ts"), "utf8"),
    ).toBe(
      'export { ValueBadge } from "./components/value-badge/ValueBadge.tsx";\nexport type { ValueBadgeProps } from "./components/value-badge/ValueBadge.tsx";\n',
    );
    expect(
      readFileSync(join(root, "packages/react/src/styles.css"), "utf8"),
    ).toBe('@import "./components/value-badge/value-badge.css";\n');
    const manifest = JSON.parse(
      readFileSync(join(root, "packages/react/package.json"), "utf8"),
    );
    expect(Object.keys(manifest.exports)).toEqual([
      ".",
      "./styles.css",
      "./package.json",
    ]);
    const css = readFileSync(
      join(root, "packages/react/src/components/value-badge/value-badge.css"),
      "utf8",
    );
    expect(css).toContain("@layer bt.components {");
    expect(css).toContain(".bt-value-badge {");
    expect(css).toContain("--bt-value-badge-gap: var(--bt-space-2);");
  });

  it("puts primitives in core's primitives layer and stylesheet", async () => {
    await createComponent({
      root,
      name: "Spacer",
      purpose: "Fills leftover space in a row",
      kind: "primitive",
      packageName: "core",
    });
    expect(
      readFileSync(join(root, "packages/core/src/styles/index.css"), "utf8"),
    ).toContain('@import "../primitives/spacer/spacer.css";');
    expect(
      readFileSync(
        join(root, "packages/core/src/primitives/spacer/Spacer.meta.ts"),
        "utf8",
      ),
    ).toContain('import type { ComponentMeta } from "../../meta.ts";');
  });

  it("writes folders the docs check passes, once docs/DOCS_SITE.md gives each a home", async () => {
    write(
      "packages/react/src/components/chip/Chip.playground.tsx",
      'export const page: DocsPage = {\n  section: "components/actions",\n  title: "Chip",\n  description: "A chip.",\n  order: 30,\n  status: "stable",\n  since: "0.4.0",\n};\n',
    );
    await createComponent({
      root,
      name: "ValueBadge",
      purpose: "Shows a slider's value next to its label",
    });
    await createComponent({
      root,
      name: "Spacer",
      purpose: "Fills leftover space in a row",
      kind: "primitive",
      packageName: "core",
    });
    const metaFiles = [
      "packages/react/src/components/value-badge/ValueBadge.meta.ts",
      "packages/core/src/primitives/spacer/Spacer.meta.ts",
    ].map((file) => join(root, file));
    const problems = checkDocs({
      contentDir: join(root, "apps/docs/content"),
      metaFiles,
      docsSite: join(root, "docs/DOCS_SITE.md"),
      references: [],
      demos: [],
      packageIndex: null,
      changelogs: [],
    });
    expect(problems).toEqual([
      expect.stringMatching(/^ValueBadge has no home in .*DOCS_SITE\.md\./),
      expect.stringMatching(/^Spacer has no home in .*DOCS_SITE\.md\./),
    ]);
    expect(
      readFileSync(
        join(
          root,
          "packages/react/src/components/value-badge/ValueBadge.playground.tsx",
        ),
        "utf8",
      ),
    ).toContain('section: "components/actions",\n  title: "ValueBadge",');
    expect(
      readFileSync(
        join(
          root,
          "packages/react/src/components/value-badge/ValueBadge.playground.tsx",
        ),
        "utf8",
      ),
    ).toContain("order: 40,");
  });

  it("puts the page in the section it's given", async () => {
    await createComponent({
      root,
      name: "ValueBadge",
      purpose: "Shows a slider's value next to its label",
      section: "components/data-display",
    });
    expect(
      readFileSync(
        join(
          root,
          "packages/react/src/components/value-badge/ValueBadge.playground.tsx",
        ),
        "utf8",
      ),
    ).toContain('section: "components/data-display",');
  });

  it("writes files that already pass the format check", async () => {
    const written = await createComponent({
      root,
      name: "SegmentedControlWithALongName",
      purpose: "Picks one of a few options with a long name",
    });
    for (const file of written) {
      const path = join(root, file);
      expect(
        await check(readFileSync(path, "utf8"), { filepath: path }),
        file,
      ).toBe(true);
    }
  });

  it("explains how to fix bad input", async () => {
    await expect(
      createComponent({ root, name: "value-badge", purpose: "Shows a value" }),
    ).rejects.toThrow(/PascalCase/);
    await expect(
      createComponent({ root, name: "ValueBadge", purpose: "" }),
    ).rejects.toThrow(/--purpose/);
    await expect(
      createComponent({
        root,
        name: "ValueBadge",
        purpose: "Shows a value",
        kind: "widget",
      }),
    ).rejects.toThrow(/Unknown kind/);
    await createComponent({
      root,
      name: "ValueBadge",
      purpose: "Shows a value",
    });
    await expect(
      createComponent({ root, name: "ValueBadge", purpose: "Shows a value" }),
    ).rejects.toThrow(/already exists/);
  });
});
