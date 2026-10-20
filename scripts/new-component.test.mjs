import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
  write(
    "packages/react/package.json",
    JSON.stringify({
      name: "@buttery/react",
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
  it("scaffolds every contract file for a react component and wires it in", () => {
    const written = createComponent({
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
        "packages/react/src/components/value-badge/value-badge.css",
      ].sort(),
    );
    const source = readFileSync(
      join(root, "packages/react/src/components/value-badge/ValueBadge.tsx"),
      "utf8",
    );
    expect(source).toContain('data-bt="ValueBadge"');
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
    expect(css).toContain("--bt-value-badge-gap: var(--bt-space-2);");
  });

  it("puts primitives in core's primitives layer and stylesheet", () => {
    createComponent({
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

  it("explains how to fix bad input", () => {
    expect(() =>
      createComponent({ root, name: "value-badge", purpose: "Shows a value" }),
    ).toThrow(/PascalCase/);
    expect(() =>
      createComponent({ root, name: "ValueBadge", purpose: "" }),
    ).toThrow(/--purpose/);
    expect(() =>
      createComponent({
        root,
        name: "ValueBadge",
        purpose: "Shows a value",
        kind: "widget",
      }),
    ).toThrow(/Unknown kind/);
    createComponent({ root, name: "ValueBadge", purpose: "Shows a value" });
    expect(() =>
      createComponent({ root, name: "ValueBadge", purpose: "Shows a value" }),
    ).toThrow(/already exists/);
  });
});
