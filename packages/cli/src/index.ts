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
import { createApp } from "./create.ts";
import { packageManagerFrom, runScript } from "./package-manager.ts";
import { projectRoot } from "./project.ts";
import { TEMPLATE_NAMES, isTemplateName } from "./templates.ts";

const HELP = `buttery: start an app on buttery, add to it, and check it.

  buttery create <folder> [--template ${TEMPLATE_NAMES.join("|")}] [--desktop] [--no-install]
      A new app from a template, named after its folder. --desktop adds the Tauri shell.
  buttery add page <kind> [--name <Name>]
      A page from buttery's patterns, such as table, detail or sign-in.
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
    dist: fileURLToPath(new URL(".", import.meta.url)),
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
