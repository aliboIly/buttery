import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GUIDE_MARKS } from "./agent-files.ts";
import { readJson } from "./project.ts";
import {
  BUTTERY_PACKAGES,
  ESLINT_CONFIGS,
  STYLE_IMPORTS,
  STYLELINT_CONFIGS,
  entryFile,
  firstExisting,
  installedVersion,
  sourceFiles,
} from "./setup.ts";

/**
 * One thing `buttery doctor` looked at: fine, a problem with its fix, or a note about something optional
 * that's missing, with its fix.
 */
export type Finding =
  | { readonly kind: "ok"; readonly what: string }
  | {
      readonly kind: "problem" | "note";
      readonly what: string;
      readonly fix: string;
    };

function text(root: string, file: string): string {
  return readFileSync(join(root, file), "utf8");
}

function importsOf(source: string): readonly string[] {
  return [
    ...source.matchAll(
      /^\s*(?:import\s+(?:[^"';]+\s+from\s+)?|@import\s+(?:url\()?)["']([^"']+)["']/gm,
    ),
  ].map((match) => match[1] ?? "");
}

function react(root: string): Finding {
  const version = installedVersion(root, "react");
  if (version === null) {
    return {
      kind: "problem",
      what: "React isn't installed.",
      fix: "npm install react@19 react-dom@19",
    };
  }
  const major = Number(version.split(".")[0]);
  return major >= 19
    ? { kind: "ok", what: `React ${version}` }
    : {
        kind: "problem",
        what: `React is ${version}, and buttery needs 19, for refs as props and the compiler.`,
        fix: "npm install react@19 react-dom@19",
      };
}

function packages(root: string): Finding {
  const installed = BUTTERY_PACKAGES.flatMap((name) => {
    const version = installedVersion(root, name);
    return version === null ? [] : [[name, version] as const];
  });
  const names = new Set(installed.map(([name]) => name));
  const missing = ["@butteryui/core", "@butteryui/react"].filter(
    (name) => !names.has(name),
  );
  if (missing.length > 0) {
    return {
      kind: "problem",
      what: `${missing.join(" and ")} ${missing.length === 1 ? "isn't" : "aren't"} installed.`,
      fix: `npm install ${missing.join(" ")}`,
    };
  }
  const minor = (version: string): string =>
    version.split(".").slice(0, 2).join(".");
  const newest = installed
    .map(([, version]) => version)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
  const behind = installed.filter(
    ([, version]) => newest !== undefined && minor(version) !== minor(newest),
  );
  if (newest === undefined || behind.length === 0) {
    return {
      kind: "ok",
      what: `${installed.map(([name]) => name).join(", ")} at ${newest ?? "?"}`,
    };
  }
  return {
    kind: "problem",
    what: `buttery's packages are at different versions: ${installed.map(([name, version]) => `${name} ${version}`).join(", ")}. They release together.`,
    fix: `npm install ${behind.map(([name]) => `${name}@${newest}`).join(" ")}`,
  };
}

function styles(root: string, entry: string | null): Finding[] {
  if (entry === null) {
    return [
      {
        kind: "problem",
        what: "No entry module was found: index.html loads none, and there's no src/main.tsx.",
        fix: `import ${STYLE_IMPORTS.map((sheet) => `"${sheet}"`).join(" and ")} at the top of the module that renders the app.`,
      },
    ];
  }
  const findings: Finding[] = [];
  const own = importsOf(text(root, entry));
  const missing = STYLE_IMPORTS.filter((sheet) => !own.includes(sheet));
  if (missing.length > 0) {
    findings.push({
      kind: "problem",
      what: `${entry} doesn't import ${missing.join(" or ")}.`,
      fix: `add ${missing.map((sheet) => `import "${sheet}";`).join(" ")} at the top of ${entry}, the core styles first.`,
    });
  } else if (
    own.indexOf(STYLE_IMPORTS[0] ?? "") > own.indexOf(STYLE_IMPORTS[1] ?? "")
  ) {
    findings.push({
      kind: "problem",
      what: `${entry} imports the react styles before the core ones, so the components' styles lose to the base ones.`,
      fix: `import "${STYLE_IMPORTS[0] ?? ""}" first.`,
    });
  } else {
    findings.push({
      kind: "ok",
      what: `${entry} imports buttery's styles, which bring the Inter font`,
    });
  }
  for (const sheet of STYLE_IMPORTS) {
    const elsewhere = sourceFiles(root).filter(
      (file) => file !== entry && importsOf(text(root, file)).includes(sheet),
    );
    if (elsewhere.length > 0) {
      findings.push({
        kind: "problem",
        what: `${sheet} is imported again in ${elsewhere.join(", ")}, which loads its rules twice.`,
        fix: `import it only in ${entry}.`,
      });
    }
  }
  return findings;
}

function provider(root: string, entry: string | null): Finding {
  const rendered = sourceFiles(root).some((file) =>
    /<ButteryProvider\b/.test(text(root, file)),
  );
  return rendered
    ? { kind: "ok", what: "ButteryProvider wraps the app" }
    : {
        kind: "problem",
        what: "Nothing renders ButteryProvider, which the theme, density, motion and LayoutGuard come from.",
        fix: `wrap the app once, in ${entry ?? "the entry module"}: <ButteryProvider><App /></ButteryProvider>, with import { ButteryProvider } from "@butteryui/react".`,
      };
}

const NETWORK_FONTS =
  /fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|fonts\.bunny\.net/;

function fonts(root: string): Finding {
  const loading = ["index.html", ...sourceFiles(root)].filter(
    (file) =>
      existsSync(join(root, file)) && NETWORK_FONTS.test(text(root, file)),
  );
  return loading.length === 0
    ? { kind: "ok", what: "No fonts load from the network" }
    : {
        kind: "problem",
        what: `${loading.join(", ")} ${loading.length === 1 ? "loads" : "load"} a font from the network, which a desktop app can't reach offline.`,
        fix: "remove it: buttery's styles bundle Inter, and a font of your own belongs in the app's files.",
      };
}

function lint(root: string): Finding[] {
  const eslint = firstExisting(root, ESLINT_CONFIGS);
  const stylelint = firstExisting(root, STYLELINT_CONFIGS);
  return [
    eslint !== null && text(root, eslint).includes("@butteryui/lint")
      ? { kind: "ok", what: `${eslint} uses buttery's rules` }
      : {
          kind: "problem",
          what:
            eslint === null
              ? "There's no ESLint config."
              : `${eslint} doesn't use buttery's rules.`,
          fix: 'add ...butteryEslintConfig() from "@butteryui/lint/eslint" to eslint.config.js, or run npx buttery init.',
        },
    stylelint !== null && text(root, stylelint).includes("@butteryui/lint")
      ? { kind: "ok", what: `${stylelint} uses buttery's rules` }
      : {
          kind: "problem",
          what:
            stylelint === null
              ? "There's no stylelint config."
              : `${stylelint} doesn't use buttery's rules.`,
          fix: 'export butteryStylelintConfig() from "@butteryui/lint/stylelint" in stylelint.config.mjs, or run npx buttery init.',
        },
  ];
}

function desktop(root: string): Finding[] {
  const file = "src-tauri/tauri.conf.json";
  if (!existsSync(join(root, file))) return [];
  const app = readJson(join(root, file))["app"];
  const windows: unknown =
    typeof app === "object" && app !== null
      ? Reflect.get(app, "windows")
      : undefined;
  const small = (Array.isArray(windows) ? windows : []).filter(
    (window: unknown) => {
      const width: unknown =
        typeof window === "object" && window !== null
          ? Reflect.get(window, "minWidth")
          : undefined;
      const height: unknown =
        typeof window === "object" && window !== null
          ? Reflect.get(window, "minHeight")
          : undefined;
      return (
        typeof width !== "number" ||
        typeof height !== "number" ||
        width < 960 ||
        height < 640
      );
    },
  );
  return [
    small.length === 0
      ? { kind: "ok", what: `${file} keeps the window at least 960 × 640` }
      : {
          kind: "problem",
          what: `${file} lets the window shrink below 960 × 640, under the layouts' smallest desktop size.`,
          fix: `set "minWidth": 960 and "minHeight": 640 on each window in ${file}.`,
        },
  ];
}

function checks(root: string): Finding {
  const missing = ["@playwright/test", "@butteryui/test"].filter(
    (name) => installedVersion(root, name) === null,
  );
  return missing.length === 0
    ? {
        kind: "ok",
        what: "buttery check can run: @playwright/test and @butteryui/test are installed",
      }
    : {
        kind: "note",
        what: `buttery check needs ${missing.join(" and ")}.`,
        fix: `npm install --save-dev ${missing.join(" ")}, then npx playwright install chromium`,
      };
}

function servesButtery(root: string): boolean {
  if (!existsSync(join(root, ".mcp.json"))) return false;
  try {
    const servers: unknown = readJson(join(root, ".mcp.json"))["mcpServers"];
    return (
      typeof servers === "object" && servers !== null && "buttery" in servers
    );
  } catch {
    return false;
  }
}

function agents(root: string): Finding {
  const file = join(root, "AGENTS.md");
  const guided =
    existsSync(file) && readFileSync(file, "utf8").includes(GUIDE_MARKS.start);
  const served = servesButtery(root);
  return guided && served
    ? { kind: "ok", what: "AGENTS.md and the agents' MCP configs know buttery" }
    : {
        kind: "note",
        what: `Coding agents won't know about buttery here: ${[guided ? null : "AGENTS.md has no buttery section", served ? null : ".mcp.json has no buttery server"].filter((part) => part !== null).join(", and ")}.`,
        fix: "npx buttery init",
      };
}

/** What `buttery doctor` finds in the app at `root`, in the order it prints it. */
export function diagnose(root: string): readonly Finding[] {
  const entry = entryFile(root);
  return [
    react(root),
    packages(root),
    ...styles(root, entry),
    provider(root, entry),
    fonts(root),
    ...lint(root),
    ...desktop(root),
    checks(root),
    agents(root),
  ];
}

/** The findings as `buttery doctor` prints them, with a closing count of the problems. */
export function formatFindings(findings: readonly Finding[]): string {
  const lines = findings.flatMap((finding) =>
    finding.kind === "ok"
      ? [`✓ ${finding.what}`]
      : [
          `${finding.kind === "problem" ? "✗" : "·"} ${finding.what}`,
          `  Fix: ${finding.fix}`,
        ],
  );
  const problems = findings.filter(
    (finding) => finding.kind === "problem",
  ).length;
  lines.push(
    "",
    problems === 0
      ? "buttery is set up here."
      : `${String(problems)} ${problems === 1 ? "problem" : "problems"} to fix.`,
  );
  return lines.join("\n");
}
