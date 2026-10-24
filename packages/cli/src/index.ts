#!/usr/bin/env node
import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createApp } from "./create.ts";
import { packageManagerFrom, runScript } from "./package-manager.ts";
import { TEMPLATE_NAMES, isTemplateName } from "./templates.ts";

const HELP = `buttery: start an app on buttery, add to it, and check it.

  buttery create <folder> [--template ${TEMPLATE_NAMES.join("|")}] [--desktop] [--no-install]
      A new app from a template, named after its folder. --desktop adds the Tauri shell.
  buttery add page <kind> [--name <Name>]
      A page from buttery's patterns, such as table, detail or sign-in.
  buttery create component <Name>
      A component of your own, built from buttery's public parts.
  buttery check [url] [--json] [--full]
      The layout checks on the running app.
  buttery doctor
      Checks the app is set up for buttery and says how to fix what isn't.
  buttery init
      Sets buttery up in a React app you have.
  buttery migrate
      Updates code for a new version of buttery.

  buttery --version
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

function run(argv: readonly string[]): void {
  const [command, ...rest] = argv;
  switch (command) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      process.stdout.write(HELP);
      return;
    case "--version":
    case "-v":
      process.stdout.write(`${ownVersion()}\n`);
      return;
    case "create":
      create(rest);
      return;
    default:
      throw new Error(
        `There's no command called "${command}". Fix: run buttery --help for the list.`,
      );
  }
}

try {
  run(process.argv.slice(2));
} catch (error) {
  process.stderr.write(
    `buttery: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
