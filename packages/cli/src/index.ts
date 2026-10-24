#!/usr/bin/env node
import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { DOCS_SITE } from "./agent-files.ts";
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
import { createComponent } from "./component.ts";
import { createApp } from "./create.ts";
import { diagnose, formatFindings } from "./doctor.ts";
import { initApp } from "./init.ts";
import { migrationsBetween } from "./migrate.ts";
import { packageManagerFrom, runScript } from "./package-manager.ts";
import { PLACEMENTS, isPageKind } from "./pages.ts";
import { projectRoot } from "./project.ts";
import { installedVersion } from "./setup.ts";
import { TEMPLATE_NAMES, isTemplateName } from "./templates.ts";

const HELP = `buttery: start an app on buttery, add to it, and check it.

  buttery create <folder> [--template ${TEMPLATE_NAMES.join("|")}] [--desktop] [--no-install]
      A new app from a template, named after its folder. --desktop adds the Tauri shell.
  buttery add page <kind> [--name <Name>]
      A page from buttery's patterns, such as table, detail or sign-in, in src/pages; a
      dashboard app gets its route and sidebar item too. buttery add page lists the kinds.
  buttery add <pattern>
      A screen from a pattern: ${["app-shell", ...Object.keys(PATTERN_PAGES)].join(", ")}.
  buttery create component <Name> --purpose "<what it's for>"
      A component of your own in src/components, on buttery's public parts and tokens, with
      examples, a preview page and a spec that runs the layout checks on it.
  buttery check [page…] [--json] [--full] [--engine chromium|webkit]
      The layout checks on each page, a path such as /settings or an address, at 390 and
      1280, light and dark, in Chromium; --full adds every width, compact density and WebKit.
      Starts the dev server when a page is a path and the app isn't running.
  buttery doctor
      Checks the app is set up for buttery and says how to fix what isn't.
  buttery init [--no-install]
      Sets buttery up in a React app you have: the packages, styles and provider, lint configs,
      and what coding agents read. Running it again changes nothing that's set up.
  buttery migrate [--to <version>]
      Updates the app's code for a newer buttery, where a release asks for changes.

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
      purpose: { type: "string", default: "" },
    },
  });
  if (positionals[0] === "component") {
    const [, name] = positionals;
    if (name === undefined) {
      throw new Error(
        'Name the component. Fix: buttery create component OrderCard --purpose "One order, as a card."',
      );
    }
    const made = createComponent(appRoot(), name, values.purpose);
    process.stdout.write(
      [
        `Made ${name}:`,
        ...made.files.map((file) => `  ${file}`),
        "",
        `See it at ${made.preview} on the dev server, check it with npx buttery check ${made.preview},`,
        `and run its spec with npx playwright test ${made.spec}.`,
        "",
      ].join("\n"),
    );
    return;
  }
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
    `\nMade ${created.name} from the ${values.template} template.\n\n${steps.map((step) => `  ${step}`).join("\n")}\n\nThen check its layout with npx buttery check, and add pages with npx buttery add page <kind>.\n`,
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

function init(args: readonly string[]): void {
  const { values } = parseArgs({
    args: [...args],
    options: { "no-install": { type: "boolean", default: false } },
  });
  const root = appRoot();
  const result = initApp({
    root,
    dist: DIST,
    version: ownVersion(),
    manager: packageManagerFrom(process.env["npm_config_user_agent"]),
    install: !values["no-install"],
    docs: DOCS_SITE,
    tarballs: process.env["BUTTERY_TARBALLS"],
  });
  if (
    result.changed.length === 0 &&
    result.installed.length === 0 &&
    result.todo.length === 0
  ) {
    process.stdout.write("buttery is already set up here.\n");
    return;
  }
  const lines = [
    ...(result.installed.length > 0
      ? [`Installed ${result.installed.join(", ")}.`]
      : []),
    ...(result.changed.length > 0
      ? ["Changed:", ...result.changed.map((file) => `  ${file}`)]
      : []),
    ...(result.todo.length > 0
      ? ["Still to do:", ...result.todo.map((step) => `  ${step}`)]
      : []),
    "",
    "Then check the setup with npx buttery doctor.",
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

function migrate(args: readonly string[]): void {
  const { values } = parseArgs({
    args: [...args],
    options: { to: { type: "string" } },
  });
  const root = appRoot();
  const from = installedVersion(root, "@butteryui/core");
  if (from === null) {
    throw new Error(
      "@butteryui/core isn't installed here, so there's nothing to migrate. Fix: run it in the app's folder, after npm install.",
    );
  }
  const to = values.to ?? ownVersion();
  const migrations = migrationsBetween(from, to);
  if (migrations.length === 0) {
    process.stdout.write(
      `Nothing to migrate: no release from ${from} to ${to} changes an app's code.\n`,
    );
    return;
  }
  for (const migration of migrations) {
    const files = migration.run(root);
    process.stdout.write(
      `${migration.version}: ${migration.what}${files.length > 0 ? ` (${files.join(", ")})` : ""}\n`,
    );
  }
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
    case "doctor": {
      const findings = diagnose(appRoot());
      process.stdout.write(`${formatFindings(findings)}\n`);
      return findings.some((finding) => finding.kind === "problem") ? 1 : 0;
    }
    case "init":
      init(rest);
      return 0;
    case "migrate":
      migrate(rest);
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
