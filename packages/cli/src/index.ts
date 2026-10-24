#!/usr/bin/env node
import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  FULL_MATRIX,
  QUICK_MATRIX,
  formatResult,
  runCheck,
  targetsFrom,
} from "./check.ts";
import type { CheckMatrix, Engine } from "./check.ts";
import {
  PATTERN_PAGES,
  addAppFrame,
  addPage,
  isPatternName,
  readPages,
} from "./add.ts";
import { createApp } from "./create.ts";
import { packageManagerFrom, runScript } from "./package-manager.ts";
import { PLACEMENTS, isPageKind } from "./pages.ts";
import { projectRoot } from "./project.ts";
import { TEMPLATE_NAMES, isTemplateName } from "./templates.ts";

const HELP = `buttery: start an app on buttery, add to it, and check it.

  buttery create <folder> [--template ${TEMPLATE_NAMES.join("|")}] [--desktop] [--no-install]
      A new app from a template, named after its folder. --desktop adds the Tauri shell.
  buttery add page <kind> [--name <Name>]
      A page from buttery's patterns, such as table, detail or sign-in, in src/pages; a
      dashboard app gets its route and sidebar item too. buttery add page lists the kinds.
  buttery add <pattern>
      A screen from a pattern: ${["app-shell", ...Object.keys(PATTERN_PAGES)].join(", ")}.
  buttery create component <Name>
      A component of your own, built from buttery's public parts.
  buttery check [page…] [--json] [--full] [--engine chromium|webkit]
      The layout checks on each page, a path such as /settings or an address, at 390 and
      1280, light and dark, in Chromium; --full adds every width, compact density and WebKit.
      Starts the dev server when a page is a path and the app isn't running.
  buttery doctor
      Checks the app is set up for buttery and says how to fix what isn't.
  buttery init
      Sets buttery up in a React app you have.
  buttery migrate
      Updates code for a new version of buttery.

  buttery --version

Exits 1 when a check finds problems, and 2 when a command can't run, saying how to fix it.
`;

const DIST = fileURLToPath(new URL(".", import.meta.url));

function ownVersion(): string {
  const manifest: unknown = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const version: unknown =
    typeof manifest === "object" && manifest !== null
      ? Reflect.get(manifest, "version")
      : undefined;
  return typeof version === "string" ? version : "0.0.0";
}

function create(args: readonly string[]): void {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      template: { type: "string", default: "blank" },
      desktop: { type: "boolean", default: false },
      "no-install": { type: "boolean", default: false },
    },
  });
  const [directory] = positionals;
  if (directory === undefined) {
    throw new Error(
      "Name the folder to make the app in. Fix: buttery create my-app",
    );
  }
  if (!isTemplateName(values.template)) {
    throw new Error(
      `There's no template called "${values.template}". Fix: pass --template with one of ${TEMPLATE_NAMES.join(", ")}.`,
    );
  }
  const manager = packageManagerFrom(process.env["npm_config_user_agent"]);
  const created = createApp({
    directory,
    template: values.template,
    desktop: values.desktop,
    install: !values["no-install"],
    manager,
    cwd: process.cwd(),
    dist: DIST,
    tarballs: process.env["BUTTERY_TARBALLS"],
  });
  const steps = [
    `cd ${directory}`,
    ...(created.installed ? [] : [`${manager} install`]),
    runScript(manager, "dev"),
  ];
  process.stdout.write(
    `\nMade ${created.name} from the ${values.template} template.\n\n${steps.map((step) => `  ${step}`).join("\n")}\n\nThen check its layout with \`npx buttery check\`, and add pages with \`npx buttery add page <kind>\`.\n`,
  );
}

function isEngine(value: string): value is Engine {
  return value === "chromium" || value === "webkit";
}

async function check(args: readonly string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      json: { type: "boolean", default: false },
      full: { type: "boolean", default: false },
      engine: { type: "string", multiple: true },
    },
  });
  const root = projectRoot(process.cwd());
  if (root === null) {
    throw new Error(
      "There's no package.json here or in a folder above, so there's no app to check. Fix: run it in the app's folder.",
    );
  }
  const base = values.full ? FULL_MATRIX : QUICK_MATRIX;
  const engines = values.engine ?? base.engines;
  const unknown = engines.find((engine) => !isEngine(engine));
  if (unknown !== undefined) {
    throw new Error(
      `There's no engine called "${unknown}". Fix: pass --engine chromium or --engine webkit.`,
    );
  }
  const matrix: CheckMatrix = { ...base, engines: engines.filter(isEngine) };
  const result = await runCheck({
    root,
    targets: targetsFrom(positionals),
    matrix,
    manager: packageManagerFrom(process.env["npm_config_user_agent"]),
    log: (line) => process.stderr.write(`${line}\n`),
  });
  process.stdout.write(
    values.json
      ? `${JSON.stringify(result.violations, null, 2)}\n`
      : `${formatResult(result, matrix)}\n`,
  );
  return result.violations.length === 0 ? 0 : 1;
}

function appRoot(): string {
  const root = projectRoot(process.cwd());
  if (root === null) {
    throw new Error(
      "There's no package.json here or in a folder above, so there's no app to add to. Fix: run it in the app's folder.",
    );
  }
  return root;
}

function pageKinds(): string {
  const lines = [
    "The pages buttery add page writes, each from its pattern's whole-page example:",
    "",
  ];
  for (const [kind, page] of readPages(DIST)) {
    lines.push(`  ${kind.padEnd(16)}${page.what} (${page.component})`);
  }
  lines.push(
    "",
    "Name it with --name, such as buttery add page table --name Customers.",
  );
  return `${lines.join("\n")}\n`;
}

function addedPage(kind: string, name: string | undefined): void {
  if (!isPageKind(kind)) {
    throw new Error(
      `There's no page called "${kind}". Fix: run buttery add page for the list.`,
    );
  }
  const added = addPage({ root: appRoot(), dist: DIST, kind, name });
  const { names } = added;
  const lines = [
    `Added ${names.file}: ${added.template.what}, from ${added.template.component}.`,
    added.wired
      ? `It's at ${names.route} in src/App.tsx, ${PLACEMENTS[kind].kind === "screen" ? "on a screen of its own" : "with an item in the sidebar"}.`
      : `Render <${names.component} /> where the app shows its pages, such as at ${names.route}.`,
    ...added.missing.map(
      (name) =>
        `It imports ${name}, which the app doesn't have yet: npm install ${name}`,
    ),
    `Check it with npx buttery check ${names.route}.`,
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

function add(args: readonly string[]): void {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      name: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [what, kind] = positionals;
  if (what === "page") {
    if (kind === undefined || values.help === true) {
      process.stdout.write(pageKinds());
      return;
    }
    addedPage(kind, values.name);
    return;
  }
  if (what === undefined || !isPatternName(what)) {
    throw new Error(
      `${what === undefined ? "Name what to add" : `There's no pattern called "${what}"`}. Fix: buttery add page <kind>, or buttery add with one of ${["app-shell", ...Object.keys(PATTERN_PAGES)].join(", ")}.`,
    );
  }
  if (what !== "app-shell") {
    addedPage(PATTERN_PAGES[what], values.name);
    return;
  }
  const frame = addAppFrame(appRoot());
  process.stdout.write(
    [
      `Added ${frame.file}: a sidebar beside a top bar, around the page that's open.`,
      "Render the app's pages inside it, as <AppFrame path={path}>{page}</AppFrame>, and list them in its sidebar.",
      ...frame.missing.map(
        (name) =>
          `It imports ${name}, which the app doesn't have yet: npm install ${name}`,
      ),
      "",
    ].join("\n"),
  );
}

async function run(argv: readonly string[]): Promise<number> {
  const [command, ...rest] = argv;
  switch (command) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      process.stdout.write(HELP);
      return 0;
    case "--version":
    case "-v":
      process.stdout.write(`${ownVersion()}\n`);
      return 0;
    case "create":
      create(rest);
      return 0;
    case "check":
      return check(rest);
    case "add":
      add(rest);
      return 0;
    default:
      throw new Error(
        `There's no command called "${command}". Fix: run buttery --help for the list.`,
      );
  }
}

function explained(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const code: unknown = Reflect.get(error, "code");
  return typeof code === "string" && code.startsWith("ERR_PARSE_ARGS")
    ? `${error.message} Fix: buttery --help lists each command's options.`
    : error.message;
}

try {
  process.exitCode = await run(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`buttery: ${explained(error)}\n`);
  process.exitCode = 2;
}
