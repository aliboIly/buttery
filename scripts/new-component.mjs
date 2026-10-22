#!/usr/bin/env node
import {
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { format, resolveConfig } from "prettier";

const KINDS = {
  primitive: {
    folder: "primitives",
    layer: "bt.primitives",
    section: "layout",
  },
  layer: { folder: "layers", layer: "bt.primitives", section: "foundations" },
  component: {
    folder: "components",
    layer: "bt.components",
    section: "components/actions",
  },
  pattern: { folder: "patterns", layer: "bt.patterns", section: "patterns" },
};

const USAGE =
  'Usage: pnpm new-component <Name> --purpose "What it is for, in one sentence." [--kind component|pattern|primitive|layer] [--package react|core] [--section components/inputs]';

export function kebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function componentSource(name, purpose, imports) {
  return `import type { ComponentPropsWithRef, ReactElement } from "react";
${imports}

/** Props for \`${name}\`. */
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
  const Root = asChild ? Slot : "div";
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
  keyboard: [],
  layout:
    "A row as wide as its container, its children centered on one line 8px apart. It truncates nothing and adds no hit area of its own.",
};
`;
}

function playgroundSource(name, packageName, page) {
  return `import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ${name} } from "${packageName}";

export const page: DocsPage = {
  section: "${page.section}",
  title: "${name}",
  description: ${JSON.stringify(page.description)},
  order: ${String(page.order)},
  status: "new",
  since: "${page.since}",
};

export const live: LiveDemo = {
  controls: {
    children: { kind: "text", initial: "${name}" },
  },
  render: ({ children }) => <${name}>{String(children)}</${name}>,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Default",
    render: () => <${name}>${name}</${name}>,
  },
];
`;
}

function exampleSource(name, packageName, purpose) {
  return `import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ${name} } from "${packageName}";

/** ${purpose} */
export function Basic${name}(): ReactElement {
  return <${name}>${name}</${name}>;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("${name}");
};
`;
}

function compositionSource(name, packageName) {
  const layout = ["Stack", "Surface", "Text"];
  const own = packageName === "@buttery/core";
  const fromCore = own ? [...layout, name].sort() : layout;
  const fromPackage = own ? "" : `import { ${name} } from "${packageName}";\n`;
  return `import type { ReactElement } from "react";
import { ${fromCore.join(", ")} } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
${fromPackage}
/** ${name} in a card, under its title. */
export function ${name}InACard(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Text variant="title-sm">A card</Text>
        <${name}>${name} in a card</${name}>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("${name} in a card");
};
`;
}

/** The section and order of every page on the docs site: the written pages and the components' `page` exports. */
function pagesIn(root) {
  const blocks = [
    ...globSync("packages/*/src/**/*.playground.tsx", { cwd: root }).map(
      (file) =>
        /export const page: DocsPage = \{([\s\S]*?)\n\};/.exec(
          readFileSync(join(root, file), "utf8"),
        )?.[1],
    ),
    ...globSync("apps/docs/content/**/*.mdx", { cwd: root }).map(
      (file) =>
        /^---\n([\s\S]*?)\n---/.exec(
          readFileSync(join(root, file), "utf8"),
        )?.[1],
    ),
  ];
  return blocks
    .filter((block) => block !== undefined)
    .map((block) => ({
      section: /section:\s*"?([a-z/-]+)"?/.exec(block)?.[1],
      order: Number(/order:\s*(\d+)/.exec(block)?.[1]),
    }));
}

/** The next order free in a docs section: 10 past the highest there, so no two pages share one. */
function nextOrder(root, section) {
  const orders = pagesIn(root)
    .filter((page) => page.section === section && Number.isFinite(page.order))
    .map((page) => page.order);
  return orders.length === 0 ? 10 : Math.max(...orders) + 10;
}

/** The release the docs site is at, from `apps/docs/src/routes.ts`, which a new component's page arrives in. */
function docsVersion(root) {
  const path = join(root, "apps/docs/src/routes.ts");
  const version = existsSync(path)
    ? /export const DOCS_VERSION = "(\d+\.\d+\.\d+)"/.exec(
        readFileSync(path, "utf8"),
      )?.[1]
    : undefined;
  if (version === undefined) {
    throw new Error(
      'apps/docs/src/routes.ts has no DOCS_VERSION, the release a new component\'s page arrives in. Fix: export const DOCS_VERSION = "x.y.z" there.',
    );
  }
  return version;
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
  section,
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
  const imports =
    packageName === "core"
      ? 'import { cx } from "../../utils/cx.ts";\nimport { Slot } from "../../utils/slot.tsx";'
      : 'import { cx, Slot } from "@buttery/core";';
  const stylesImports =
    packageName === "core"
      ? ["../../styles/index.css"]
      : ["@buttery/core/styles.css", "../../styles.css"];

  const docsSection = section ?? settings.section;
  const page = {
    section: docsSection,
    description: sentence,
    order: nextOrder(root, docsSection),
    since: docsVersion(root),
  };

  const files = {
    [`${name}.tsx`]: componentSource(name, sentence, imports),
    [`${kebabCase(name)}.css`]: cssSource(name, settings.layer),
    [`${name}.test.tsx`]: testSource(name, stylesImports),
    [`${name}.meta.ts`]: metaSource(name, kind, sentence, metaImport),
    [`${name}.playground.tsx`]: playgroundSource(name, npmName, page),
    "examples/basic.tsx": exampleSource(name, npmName, sentence),
    "examples/composition.tsx": compositionSource(name, npmName),
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
      section: { type: "string" },
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
        section: values.section,
      });
      process.stdout.write(
        [
          `Created ${name}:`,
          ...written.map((file) => `  ${file}`),
          "",
          `Next: build out the component, then fill in ${name}.meta.ts: useWhen, avoidWhen, related and a11y,`,
          'the keyboard table and layout note for what it becomes, and reducedMotion once its motion isn\'t "none".',
          `Replace the two examples with real ones, check the page's section and order in ${name}.playground.tsx,`,
          `and add ${name} to its section's row in docs/DOCS_SITE.md. pnpm check fails until the contract is complete.`,
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
