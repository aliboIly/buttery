import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import {
  AGENT_CONFIGS,
  withAgentsImport,
  withCodexServer,
  withGuide,
  withServer,
} from "./agent-files.ts";
import { pointAtTarballs, readVersions } from "./create.ts";
import type { PackageManager } from "./package-manager.ts";
import { readJson, writeJson } from "./project.ts";
import {
  ESLINT_CONFIGS,
  STYLE_IMPORTS,
  STYLELINT_CONFIGS,
  entryFile,
  firstExisting,
  installedVersion,
  listedDependencies,
} from "./setup.ts";

/** What `buttery init` sets up, where. */
export interface InitOptions {
  readonly root: string;
  /** The command line's own `dist` folder, which holds the skill. */
  readonly dist: string;
  /** The version of buttery's packages to install, the command line's own. */
  readonly version: string;
  readonly manager: PackageManager;
  /** Installs the packages that are missing; when false, says how instead. */
  readonly install: boolean;
  /** The docs site, for the `AGENTS.md` section. */
  readonly docs: string;
  /** A folder of packed `@butteryui/*` tarballs to install in place of the published packages, for testing. */
  readonly tarballs?: string | undefined;
}

/** What `buttery init` did, and what's left for a person to do. */
export interface InitResult {
  /** Files it wrote or changed, from the app's folder. */
  readonly changed: readonly string[];
  /** Packages it installed, or would have. */
  readonly installed: readonly string[];
  /** Steps it couldn't take for certain, each with how. */
  readonly todo: readonly string[];
}

const DEPENDENCIES = ["@butteryui/core", "@butteryui/react"];
const DEV_DEPENDENCIES = [
  "@butteryui/cli",
  "@butteryui/lint",
  "@butteryui/mcp",
  "@butteryui/test",
  "@playwright/test",
];

const LINT_TOOLS = ["eslint", "typescript-eslint", "stylelint"];

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

/** `source`, an entry module, with buttery's styles imported at the top. */
export function withStyles(source: string): string {
  const missing = STYLE_IMPORTS.filter(
    (sheet) => !source.includes(`"${sheet}"`) && !source.includes(`'${sheet}'`),
  );
  if (missing.length === 0) return source;
  return `${missing.map((sheet) => `import "${sheet}";`).join("\n")}\n${source}`;
}

/**
 * `source`, an entry module, with `<App />` rendered inside `ButteryProvider` and the provider imported.
 * Null when there's no `<App />` to wrap, so the app has to be wrapped by hand.
 */
export function withProvider(source: string): string | null {
  if (/<ButteryProvider\b/.test(source)) return source;
  const app = /^([ \t]*)<App\s*\/>[ \t]*$/m.exec(source);
  let wrapped: string;
  if (app !== null) {
    const indent = app[1] ?? "";
    wrapped = source.replace(
      app[0],
      `${indent}<ButteryProvider>\n${indent}  <App />\n${indent}</ButteryProvider>`,
    );
  } else if (/<App\s*\/>/.test(source)) {
    wrapped = source.replace(
      /<App\s*\/>/,
      "<ButteryProvider><App /></ButteryProvider>",
    );
  } else {
    return null;
  }
  const imports = [...wrapped.matchAll(/^import[\s\S]*?;[ \t]*$/gm)].at(-1);
  const at = imports === undefined ? 0 : imports.index + imports[0].length;
  const line = 'import { ButteryProvider } from "@butteryui/react";';
  return at === 0
    ? `${line}\n${wrapped}`
    : `${wrapped.slice(0, at)}\n${line}${wrapped.slice(at)}`;
}

function update(
  root: string,
  file: string,
  next: (existing: string) => string | null,
  changed: string[],
): boolean {
  const path = join(root, file);
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const updated = next(existing);
  if (updated === null) return false;
  if (updated !== existing) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, updated);
    if (!changed.includes(file)) changed.push(file);
  }
  return true;
}

/**
 * Sets buttery up in a React app: its packages, the styles and the provider at the entry, buttery's lint
 * configs, buttery's VS Code snippets, and what coding agents read (an `AGENTS.md` section, the `CLAUDE.md`
 * import, the skill and the MCP server in each agent's config). Running it again changes nothing that's already set up.
 */
export function initApp(options: InitOptions): InitResult {
  const { root } = options;
  const listed = listedDependencies(root);
  if (!listed.has("react")) {
    throw new Error(
      "This app doesn't depend on react, and buttery is for React apps. Fix: run it in a React app's folder, or start one with npx create-buttery my-app.",
    );
  }
  const changed: string[] = [];
  const todo: string[] = [];

  const eslint = firstExisting(root, ESLINT_CONFIGS);
  const stylelint = firstExisting(root, STYLELINT_CONFIGS);
  const wanted = (names: readonly string[]): readonly string[] =>
    names.filter((name) => !listed.has(name));
  const dependencies = wanted(DEPENDENCIES);
  const devDependencies = wanted([...DEV_DEPENDENCIES, ...LINT_TOOLS]);
  const versions = readVersions(options.dist);
  const range = (name: string): string =>
    name.startsWith("@butteryui/")
      ? `^${options.version}`
      : (versions.tools[name] ?? versions.catalog[name] ?? "latest");
  if (dependencies.length > 0 || devDependencies.length > 0) {
    const manifest = readJson(join(root, "package.json"));
    const listedIn = (field: string): Record<string, string> => {
      const value = manifest[field];
      return typeof value === "object" && value !== null
        ? Object.fromEntries(
            Object.entries(value).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            ),
          )
        : {};
    };
    const added = (
      field: string,
      names: readonly string[],
    ): Record<string, string> =>
      Object.fromEntries(
        [
          ...Object.entries(listedIn(field)),
          ...names.map((name): [string, string] => [name, range(name)]),
        ].sort(([a], [b]) => a.localeCompare(b)),
      );
    writeJson(join(root, "package.json"), {
      ...manifest,
      dependencies: added("dependencies", dependencies),
      devDependencies: added("devDependencies", devDependencies),
    });
    changed.push("package.json");
  }
  const uninstalled = [
    ...DEPENDENCIES,
    ...DEV_DEPENDENCIES,
    ...LINT_TOOLS,
  ].filter((name) => installedVersion(root, name) === null);
  if (uninstalled.length > 0) {
    if (options.tarballs !== undefined) {
      pointAtTarballs(root, options.tarballs, options.manager);
    }
    const command = `${options.manager} install`;
    if (options.install) {
      const result = spawnSync(options.manager, ["install"], {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32",
      });
      if (result.status !== 0) {
        throw new Error(
          `${command} failed. Fix: run it yourself, then npx buttery doctor.`,
        );
      }
    } else {
      todo.push(`Install what package.json lists: ${command}`);
    }
  }

  const entry = entryFile(root);
  if (entry === null) {
    todo.push(
      `Import ${STYLE_IMPORTS.map((sheet) => `"${sheet}"`).join(" and ")} at the top of the module that renders the app, and wrap the app in <ButteryProvider> from "@butteryui/react".`,
    );
  } else {
    update(root, entry, withStyles, changed);
    const wrapped = update(root, entry, withProvider, changed);
    if (!wrapped) {
      todo.push(
        `Wrap what ${entry} renders in <ButteryProvider>, imported from "@butteryui/react".`,
      );
    }
  }

  if (eslint === null) {
    update(root, "eslint.config.js", () => ESLINT_CONFIG, changed);
  } else if (
    !readFileSync(join(root, eslint), "utf8").includes("@butteryui/lint")
  ) {
    todo.push(
      `Add buttery's rules to ${eslint}: import { butteryEslintConfig } from "@butteryui/lint/eslint", then ...butteryEslintConfig() at the end of the exported list.`,
    );
  }
  if (stylelint === null) {
    update(root, "stylelint.config.mjs", () => STYLELINT_CONFIG, changed);
  } else if (
    !readFileSync(join(root, stylelint), "utf8").includes("@butteryui/lint")
  ) {
    todo.push(
      `Use buttery's rules in ${stylelint}: export butteryStylelintConfig() from "@butteryui/lint/stylelint", or extend it.`,
    );
  }
  update(
    root,
    "package.json",
    (existing) => {
      const manifest = readJson(join(root, "package.json"));
      const scripts =
        typeof manifest["scripts"] === "object" && manifest["scripts"] !== null
          ? Object.fromEntries(Object.entries(manifest["scripts"]))
          : {};
      const added = {
        ...("lint" in scripts
          ? {}
          : {
              lint: 'eslint . && stylelint "src/**/*.css" --allow-empty-input',
            }),
        ...("check" in scripts ? {} : { check: "buttery check" }),
      };
      if (Object.keys(added).length === 0) return existing;
      return `${JSON.stringify({ ...manifest, scripts: { ...scripts, ...added } }, null, 2)}\n`;
    },
    changed,
  );

  update(
    root,
    "AGENTS.md",
    (existing) => withGuide(existing, options.docs),
    changed,
  );
  update(root, "CLAUDE.md", withAgentsImport, changed);
  const skill = readFileSync(join(options.dist, "skill", "SKILL.md"), "utf8");
  const snippets = readFileSync(
    join(options.dist, "skill", "buttery.code-snippets"),
    "utf8",
  );
  update(root, ".claude/skills/make-it-buttery/SKILL.md", () => skill, changed);
  update(root, ".vscode/buttery.code-snippets", () => snippets, changed);

  for (const file of Object.keys(AGENT_CONFIGS)) {
    const merged = update(
      root,
      file,
      (existing) =>
        file.endsWith(".toml")
          ? withCodexServer(existing)
          : withServer(file, existing),
      changed,
    );
    if (!merged) {
      todo.push(
        `${file} isn't JSON buttery can read. Fix: add the buttery server to it by hand, as the MCP server's docs show.`,
      );
    }
  }
  return {
    changed,
    installed: options.install ? uninstalled : [],
    todo,
  };
}
