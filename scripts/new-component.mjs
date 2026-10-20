#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { format, resolveConfig } from "prettier";

const KINDS = {
  primitive: { folder: "primitives", layer: "bt.primitives" },
  layer: { folder: "layers", layer: "bt.primitives" },
  component: { folder: "components", layer: "bt.components" },
  pattern: { folder: "patterns", layer: "bt.patterns" },
};

const USAGE =
  'Usage: pnpm new-component <Name> --purpose "What it is for, in one sentence." [--kind component|pattern|primitive|layer] [--package react|core]';

export function kebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function componentSource(name, purpose, cxImport) {
  return `import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { cx } from "${cxImport}";

export interface ${name}Props extends ComponentPropsWithRef<"div"> {
  /** Render the single child element instead of a \`div\`, with ${name}'s props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * ${purpose}
 *
 * @example
 * <${name} />
 */
export function ${name}({ asChild = false, className, ...rest }: ${name}Props): ReactElement {
  const Root = asChild ? Slot.Root : "div";
  return <Root {...rest} className={cx("bt-${kebabCase(name)}", className)} data-bt="${name}" />;
}
`;
}

function cssSource(name, layer) {
  const prefix = `--bt-${kebabCase(name)}`;
  return `@layer ${layer} {
  .bt-${kebabCase(name)} {
    ${prefix}-gap: var(--bt-space-2);

    display: flex;
    align-items: center;
    gap: var(${prefix}-gap);
    min-inline-size: 0;
  }
}
`;
}

function testSource(name, stylesImports) {
  return `${stylesImports.map((path) => `import "${path}";`).join("\n")}
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ${name} } from "./${name}.tsx";

afterEach(cleanup);

describe("${name}", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<${name} ref={ref} aria-label="Example" className="custom" />);
    expect(ref.current?.dataset["bt"]).toBe("${name}");
    expect(ref.current?.getAttribute("aria-label")).toBe("Example");
    expect(ref.current?.className).toBe("bt-${kebabCase(name)} custom");
  });
});
`;
}

function metaSource(name, kind, purpose, metaImport) {
  return `import type { ComponentMeta } from "${metaImport}";

export const meta: ComponentMeta = {
  name: "${name}",
  kind: "${kind}",
  purpose: ${JSON.stringify(purpose)},
  useWhen: [],
  avoidWhen: [],
  related: [],
  a11y: "",
  motion: "none",
};
`;
}

function playgroundSource(name, packageName) {
  return `import { ${name} } from "${packageName}";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Default",
    render: () => <${name} />,
  },
];
`;
}

function exampleSource(name, packageName, purpose) {
  return `import type { ReactElement } from "react";
import { ${name} } from "${packageName}";

/** ${purpose} */
export function Basic${name}(): ReactElement {
  return <${name} />;
}
`;
}

function appendLine(file, line) {
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (current.includes(line)) return;
  const separator = current === "" || current.endsWith("\n") ? "" : "\n";
  writeFileSync(file, `${current}${separator}${line}\n`);
}

function ensureStylesExport(packageJsonPath) {
  const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  if (manifest.exports["./styles.css"]) return;
  const { "./package.json": packageEntry, ...rest } = manifest.exports;
  manifest.exports = {
    ...rest,
    "./styles.css": {
      "@buttery/source": "./src/styles.css",
      default: "./dist/styles.css",
    },
    "./package.json": packageEntry,
  };
  writeFileSync(packageJsonPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function formatted(path, content) {
  const config = await resolveConfig(path);
  return format(content, { ...config, filepath: path });
}

/**
 * Scaffolds a contract-compliant component folder, formatted with the repo's Prettier config, and wires it
 * into its package. Resolves to the files written.
 */
export async function createComponent({
  root,
  name,
  purpose,
  kind = "component",
  packageName = "react",
}) {
  if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) {
    throw new Error(
      `"${name}" isn't a PascalCase component name. Fix: pnpm new-component SegmentedControl …`,
    );
  }
  if (!purpose || purpose.trim().length < 10) {
    throw new Error(
      `${name} needs a --purpose sentence for its JSDoc and manifest entry. Fix: ${USAGE}`,
    );
  }
  const settings = KINDS[kind];
  if (!settings)
    throw new Error(
      `Unknown kind "${kind}". Fix: use one of ${Object.keys(KINDS).join(", ")}.`,
    );
  if (packageName !== "react" && packageName !== "core") {
    throw new Error(
      `Unknown package "${packageName}". Fix: use --package react or --package core.`,
    );
  }

  const packageDir = join(root, "packages", packageName);
  const folder = join(packageDir, "src", settings.folder, kebabCase(name));
  if (existsSync(folder))
    throw new Error(`${relative(root, folder)} already exists.`);

  const npmName = `@buttery/${packageName}`;
  const sentence = purpose.trim().replace(/\.?$/, ".");
  const metaImport = packageName === "core" ? "../../meta.ts" : "@buttery/core";
  const cxImport =
    packageName === "core" ? "../../utils/cx.ts" : "@buttery/core";
  const stylesImports =
    packageName === "core"
      ? ["../../styles/index.css"]
      : ["@buttery/core/styles.css", "../../styles.css"];

  const files = {
    [`${name}.tsx`]: componentSource(name, sentence, cxImport),
    [`${kebabCase(name)}.css`]: cssSource(name, settings.layer),
    [`${name}.test.tsx`]: testSource(name, stylesImports),
    [`${name}.meta.ts`]: metaSource(name, kind, sentence, metaImport),
    [`${name}.playground.tsx`]: playgroundSource(name, npmName),
    "examples/basic.tsx": exampleSource(name, npmName, sentence),
  };

  const written = [];
  for (const [file, content] of Object.entries(files)) {
    const path = join(folder, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, await formatted(path, content));
    written.push(relative(root, path));
  }

  const modulePath = `./${settings.folder}/${kebabCase(name)}/${name}.tsx`;
  appendLine(
    join(packageDir, "src", "index.ts"),
    `export { ${name} } from "${modulePath}";`,
  );
  appendLine(
    join(packageDir, "src", "index.ts"),
    `export type { ${name}Props } from "${modulePath}";`,
  );

  const cssPath = `${settings.folder}/${kebabCase(name)}/${kebabCase(name)}.css`;
  if (packageName === "core") {
    appendLine(
      join(packageDir, "src", "styles", "index.css"),
      `@import "../${cssPath}";`,
    );
  } else {
    appendLine(
      join(packageDir, "src", "styles.css"),
      `@import "./${cssPath}";`,
    );
    ensureStylesExport(join(packageDir, "package.json"));
  }
  return written;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      purpose: { type: "string" },
      kind: { type: "string", default: "component" },
      package: { type: "string" },
    },
  });
  const [name] = positionals;
  if (!name) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 1;
  } else {
    try {
      const kind = values.kind;
      const packageName =
        values.package ??
        (kind === "primitive" || kind === "layer" ? "core" : "react");
      const root = fileURLToPath(new URL("..", import.meta.url));
      const written = await createComponent({
        root,
        name,
        purpose: values.purpose,
        kind,
        packageName,
      });
      process.stdout.write(
        [
          `Created ${name}:`,
          ...written.map((file) => `  ${file}`),
          "",
          `Next: fill in ${name}.meta.ts (useWhen, avoidWhen, related, a11y, motion), add a second example,`,
          "and build out the component. pnpm check fails until the contract is complete.",
          "",
        ].join("\n"),
      );
    } catch (error) {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    }
  }
}
