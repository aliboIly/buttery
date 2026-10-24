/** A template's name. */
export type TemplateName = "blank" | "dashboard" | "editor" | "marketing";

/** The templates `buttery create` copies, and the folder in buttery's repository each is built from. */
export const TEMPLATE_SOURCES: Readonly<Record<TemplateName, string>> = {
  blank: "apps/starter",
  dashboard: "apps/templates/dashboard",
  editor: "apps/templates/editor",
  marketing: "apps/templates/marketing",
};

/** Every template, in the order help lists them. */
export const TEMPLATE_NAMES: readonly TemplateName[] = [
  "blank",
  "dashboard",
  "editor",
  "marketing",
];

/** Whether `value` names a template. */
export function isTemplateName(value: string): value is TemplateName {
  return Object.hasOwn(TEMPLATE_SOURCES, value);
}

/** The versions a template's dependencies take outside buttery's repository. */
export interface Versions {
  /** buttery's own packages, which release together. */
  readonly buttery: string;
  /** The repository's catalog: a package's name and the range every app in the repository uses. */
  readonly catalog: Readonly<Record<string, string>>;
  /** The lint tools the repository's root installs: `eslint`, `stylelint` and `typescript-eslint`. */
  readonly tools: Readonly<Record<string, string>>;
}

type Dependencies = Readonly<Record<string, string>>;

function dependenciesIn(manifest: object, field: string): Dependencies {
  const listed: unknown = Reflect.get(manifest, field);
  if (typeof listed !== "object" || listed === null) return {};
  return Object.fromEntries(
    Object.entries(listed).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function resolved(
  name: string,
  range: string,
  versions: Versions,
): readonly [string, string] {
  if (range.startsWith("workspace:")) return [name, `^${versions.buttery}`];
  if (range !== "catalog:") return [name, range];
  const fromCatalog = versions.catalog[name];
  if (fromCatalog === undefined) {
    throw new Error(
      `${name} asks for the catalog's version, and the catalog has none. Fix: add it to the catalog in pnpm-workspace.yaml.`,
    );
  }
  return [name, fromCatalog];
}

function sorted(dependencies: Dependencies): Dependencies {
  return Object.fromEntries(
    Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function tool(versions: Versions, name: string): string {
  const range = versions.tools[name] ?? versions.catalog[name];
  if (range === undefined) {
    throw new Error(
      `No version for ${name}. Fix: install it at the repository's root or add it to the catalog.`,
    );
  }
  return range;
}

/**
 * A template's `package.json` as an app of its own: real versions in place of `workspace:` and `catalog:`,
 * the scripts an app runs, buttery's command line tool, lint configs, test kit and MCP server among its
 * dev dependencies, and nothing the repository uses to preview it.
 */
export function appManifest(
  template: object,
  versions: Versions,
): Readonly<Record<string, unknown>> {
  const dependencies = Object.fromEntries(
    Object.entries(dependenciesIn(template, "dependencies")).map(
      ([name, range]) => resolved(name, range, versions),
    ),
  );
  const devDependencies: Record<string, string> = Object.fromEntries(
    Object.entries(dependenciesIn(template, "devDependencies")).map(
      ([name, range]) => resolved(name, range, versions),
    ),
  );
  for (const name of ["cli", "lint", "mcp", "test"]) {
    devDependencies[`@butteryui/${name}`] = `^${versions.buttery}`;
  }
  for (const name of [
    "@playwright/test",
    "eslint",
    "stylelint",
    "typescript",
    "typescript-eslint",
  ]) {
    devDependencies[name] = tool(versions, name);
  }
  delete devDependencies["@tauri-apps/cli"];
  return {
    name: "buttery-app",
    version: "0.1.0",
    private: true,
    type: "module",
    config: { port: 5173 },
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      typecheck: "tsc --noEmit",
      lint: 'eslint . && stylelint "src/**/*.css" --allow-empty-input',
      "test:e2e": "playwright test",
      check: "buttery check",
    },
    dependencies: sorted(dependencies),
    devDependencies: sorted(devDependencies),
  };
}

/** `manifest` with what a desktop app adds: the Tauri command line and its script. */
export function withDesktop(
  manifest: Readonly<Record<string, unknown>>,
  versions: Versions,
): Readonly<Record<string, unknown>> {
  const scripts = dependenciesIn(manifest, "scripts");
  const devDependencies = dependenciesIn(manifest, "devDependencies");
  return {
    ...manifest,
    scripts: { ...scripts, tauri: "tauri" },
    devDependencies: sorted({
      ...devDependencies,
      "@tauri-apps/cli": tool(versions, "@tauri-apps/cli"),
    }),
  };
}

const TSCONFIG = `${JSON.stringify(
  {
    compilerOptions: {
      target: "es2024",
      lib: ["es2024", "dom", "dom.iterable"],
      module: "preserve",
      moduleResolution: "bundler",
      moduleDetection: "force",
      resolveJsonModule: true,
      allowImportingTsExtensions: true,
      jsx: "react-jsx",
      types: ["vite/client"],
      strict: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      noImplicitOverride: true,
      noFallthroughCasesInSwitch: true,
      noPropertyAccessFromIndexSignature: true,
      verbatimModuleSyntax: true,
      isolatedModules: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["src"],
  },
  null,
  2,
)}\n`;

const VITE_CONFIG = `import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

const { port } = manifest.config;

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: { port, strictPort: true },
  preview: { port: port + 2000, strictPort: true },
  build: { target: ["es2024", "safari17.5", "chrome130"] },
});
`;

const ESLINT_CONFIG = `import tseslint from "typescript-eslint";
import { butteryEslintConfig } from "@butteryui/lint/eslint";

export default [
  { ignores: ["dist", "test-results", "playwright-report", "src-tauri"] },
  ...tseslint.configs.recommended,
  ...butteryEslintConfig(),
];
`;

const STYLELINT_CONFIG = `import { butteryStylelintConfig } from "@butteryui/lint/stylelint";

export default butteryStylelintConfig();
`;

const PLAYWRIGHT_CONFIG = `import { defineConfig, devices } from "@playwright/test";
import manifest from "./package.json" with { type: "json" };

const origin = \`http://localhost:\${String(manifest.config.port)}\`;

export default defineConfig({
  testDir: "e2e",
  reporter: "list",
  use: { baseURL: origin },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: { command: "npm run dev", url: origin, reuseExistingServer: true },
});
`;

const GITIGNORE = `node_modules
dist
test-results
playwright-report
src-tauri/target
`;

const CLAUDE_MD = `@AGENTS.md
`;

const MCP_JSON = `${JSON.stringify(
  {
    mcpServers: {
      buttery: { type: "stdio", command: "npx", args: ["buttery-mcp"] },
    },
  },
  null,
  2,
)}\n`;

/** Instructions for the coding agents that work in an app made from a template. */
export function agentsFile(title: string, docs: string): string {
  return `# ${title}

This app is built with buttery, a React design system: tokens, layout primitives, components and patterns, with checks that fail when something overlaps, overflows or drifts off the scale. Build with it, not around it.

## Before you change UI
- Look a component up before you use it: the \`buttery\` MCP server in \`.mcp.json\` answers with \`buttery_search\` and \`buttery_get\`, and \`buttery_scaffold\` starts a whole page. Without it, the docs are at ${docs}, every page also as Markdown at its path plus \`.md\`.
- Follow \`.claude/skills/make-it-buttery/SKILL.md\` for any screen you build or restyle.

## Rules
1. Tokens only: colors, sizes, radii, shadows, durations and z-indexes come from \`var(--bt-*)\`, or from a spacing step on a primitive (\`gap={3}\`, \`pad={4}\`).
2. Lay things out with \`Stack\`, \`Inline\` and \`Grid\` and a gap: no outer margins, no negative margins, no \`position: absolute\` or \`fixed\` in app code.
3. Overlays only through buttery's layers: \`Menu\`, \`Select\`, \`Popover\`, \`Dialog\`, \`Sheet\`, \`toast()\`.
4. Text through \`Text\` with a role, icons through \`Icon\`, and buttery's components before hand-made controls.

## Checks
- \`npm run typecheck\` and \`npm run lint\` (buttery's lint configs flag raw values, stray positioning and \`transition: all\`).
- \`npx buttery check\` runs the layout checks on the running app at 390 and 1280, light and dark, and says how to fix what it finds; \`--json\` for a machine.
`;
}

/** A template's README, for the app made from it. */
export function readmeFile(
  title: string,
  template: TemplateName,
  docs: string,
): string {
  return `# ${title}

A buttery app, started from the \`${template}\` template.

\`\`\`sh
npm run dev        # the app, on the port in package.json
npm run lint       # ESLint and stylelint with buttery's rules
npm run typecheck
npx buttery check  # the layout checks on the running app
\`\`\`

Add a page from buttery's patterns with \`npx buttery add page <kind>\` (\`npx buttery add page --help\` lists them), and check your setup with \`npx buttery doctor\`. buttery's docs are at ${docs}.
`;
}

/** Files every app made from a template has, by path; \`_gitignore\` becomes \`.gitignore\` when it's copied. */
export const APP_FILES: Readonly<Record<string, string>> = {
  "tsconfig.json": TSCONFIG,
  "vite.config.ts": VITE_CONFIG,
  "eslint.config.js": ESLINT_CONFIG,
  "stylelint.config.mjs": STYLELINT_CONFIG,
  "playwright.config.ts": PLAYWRIGHT_CONFIG,
  _gitignore: GITIGNORE,
  "CLAUDE.md": CLAUDE_MD,
  ".mcp.json": MCP_JSON,
};
