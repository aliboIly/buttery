#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  globSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

/** Where each template's app is copied from: `blank` is the starter, the desktop shell included. */
export const TEMPLATES = {
  blank: join("apps", "starter"),
  dashboard: join("apps", "templates", "dashboard"),
  editor: join("apps", "templates", "editor"),
  marketing: join("apps", "templates", "marketing"),
};

/** The folders apps live in, whose ports a new app's must differ from. */
const APP_FOLDERS = ["apps", join("apps", "templates"), join("apps", "demos")];

const USAGE =
  'Usage: pnpm new-app <name> [--template blank|dashboard|editor|marketing]. Fix: give a kebab-case name, e.g. "pnpm new-app plant-shop --template dashboard".';

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function isSkipped(path) {
  const posix = path.split(sep).join("/");
  return (
    /(?:^|\/)(?:node_modules|dist|\.tsbuild)(?:\/|$)/.test(posix) ||
    /^src-tauri\/(?:target|gen)(?:\/|$)/.test(posix)
  );
}

/** Every port an app in the repository already uses, from each app's `package.json` `config.port`. */
export function usedPorts(root) {
  return APP_FOLDERS.flatMap((folder) => {
    const path = join(root, folder);
    if (!existsSync(path)) return [];
    return readdirSync(path, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          existsSync(join(path, entry.name, "package.json")),
      )
      .map(
        (entry) =>
          readJson(join(path, entry.name, "package.json")).config?.port,
      )
      .filter((port) => typeof port === "number");
  });
}

/** An app's name as its `index.html` titles it, which the copy's name replaces wherever it appears. */
function titleIn(folder, source) {
  const title = /<title>([^<]+)<\/title>/.exec(
    readFileSync(join(folder, "index.html"), "utf8"),
  )?.[1];
  if (title === undefined) {
    throw new Error(
      `${source}/index.html has no <title>. Fix: give it one, which new-app renames.`,
    );
  }
  return title;
}

/**
 * Copies a template to `apps/<name>`: `blank` copies the starter, desktop shell and all, and the others
 * copy their folder in `apps/templates`. The copy takes the name, the next free port and a place in the
 * root tsconfig, and its name replaces the template's wherever the template shows it. Returns where it
 * went and its port.
 */
export function createApp({
  root,
  name,
  template = "blank",
  install = true,
  format = true,
}) {
  if (!name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(USAGE);
  }
  const source = Object.hasOwn(TEMPLATES, template)
    ? TEMPLATES[template]
    : undefined;
  if (source === undefined) {
    throw new Error(
      `There's no template called "${String(template)}". Fix: pass --template with one of ${Object.keys(TEMPLATES).join(", ")}.`,
    );
  }
  const from = join(root, source);
  const target = join("apps", name);
  const to = join(root, target);
  if (existsSync(to)) throw new Error(`apps/${name} already exists.`);

  const port = Math.max(...usedPorts(root)) + 1;
  const title = name.replaceAll("-", " ");
  const named = titleIn(from, source.split(sep).join("/"));

  cpSync(from, to, {
    recursive: true,
    filter: (path) => !isSkipped(relative(from, path)),
  });

  const manifest = readJson(join(to, "package.json"));
  writeJson(join(to, "package.json"), {
    ...manifest,
    name,
    config: { ...manifest.config, port },
  });

  for (const file of [
    "index.html",
    ...globSync("src/**/*.{ts,tsx}", { cwd: to }),
    ...globSync("e2e/**/*.ts", { cwd: to }),
  ]) {
    const path = join(to, file);
    const text = readFileSync(path, "utf8");
    if (text.includes(named))
      writeFileSync(path, text.replaceAll(named, title));
  }

  // A template sits a folder deeper than the app made from it, so its paths to the root lose a step.
  const depth = relative(join(root, "apps"), from).split(sep).length;
  if (depth > 1) {
    const path = join(to, "tsconfig.json");
    writeFileSync(
      path,
      readFileSync(path, "utf8").replaceAll(
        "../".repeat(depth + 1),
        "../".repeat(2),
      ),
    );
  }

  const tauriPath = join(to, "src-tauri", "tauri.conf.json");
  if (existsSync(tauriPath)) {
    const tauri = readJson(tauriPath);
    const [window, ...otherWindows] = tauri.app.windows;
    writeJson(tauriPath, {
      ...tauri,
      productName: title,
      identifier: `dev.buttery.${name}`,
      build: { ...tauri.build, devUrl: `http://localhost:${String(port)}` },
      app: { ...tauri.app, windows: [{ ...window, title }, ...otherWindows] },
    });
  }

  const solutionPath = join(root, "tsconfig.json");
  const solution = readJson(solutionPath);
  writeJson(solutionPath, {
    ...solution,
    references: [...solution.references, { path: `./apps/${name}` }],
  });

  if (format) {
    execFileSync(
      "pnpm",
      ["exec", "prettier", "--write", "--log-level=warn", to, solutionPath],
      { stdio: "inherit", cwd: root },
    );
  }
  if (install)
    execFileSync("pnpm", ["install"], { stdio: "inherit", cwd: root });
  return { folder: target, port, desktop: existsSync(tauriPath) };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: { template: { type: "string", default: "blank" } },
    });
    const [name] = positionals;
    const root = fileURLToPath(new URL("..", import.meta.url));
    const { folder, port, desktop } = createApp({
      root,
      name,
      template: values.template,
    });
    process.stdout.write(
      [
        `Created ${folder.split(sep).join("/")} from the ${values.template} template (dev server on port ${String(port)}).`,
        `  pnpm --filter ${name} dev`,
        ...(desktop ? [`  pnpm --filter ${name} tauri dev`] : []),
        "",
      ].join("\n"),
    );
  } catch (error) {
    process.stderr.write(
      `new-app: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
