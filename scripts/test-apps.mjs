#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * The command line's acceptance run, outside the repository and from packed tarballs: an app from each
 * template (the marketing one through create-buttery) passes its own typecheck, lint, build and e2e specs and
 * `buttery check` on every route, unchanged; the dashboard does again with every kind of page and a component
 * of its own added; and a plain React app passes `buttery doctor`, typecheck, lint and build after
 * `buttery init`, the packages it installed ship their docs and examples, and `buttery check` reports on its
 * plain markup. `--templates=blank,dashboard` picks templates (`none` for only the plain app), and `--full`
 * checks the full matrix.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const cli = join(root, "packages/cli/dist/index.js");
const createButtery = join(root, "packages/create-buttery/dist/index.js");
const flag = (name) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
const templates = (flag("templates") ?? "blank,dashboard,editor,marketing")
  .split(",")
  .filter((name) => name !== "" && name !== "none");
const full = process.argv.includes("--full");
const work = mkdtempSync(join(tmpdir(), "buttery-apps-"));
const tarballs = join(work, "tarballs");
const failures = [];

function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
    maxBuffer: 256 * 1024 * 1024,
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    output: `${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`,
  };
}

function step(app, name, result) {
  process.stdout.write(`${result.ok ? "✓" : "✗"} ${app}: ${name}\n`);
  if (!result.ok) {
    failures.push(`${app}: ${name}`);
    const lines = result.output.trimEnd().split("\n").slice(-40);
    process.stdout.write(`${lines.map((line) => `    ${line}`).join("\n")}\n`);
  }
  return result.ok;
}

function parsedArray(text) {
  try {
    const value = JSON.parse(text);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function routesOf(app) {
  const source = readFileSync(join(app, "src/App.tsx"), "utf8");
  const block = /export const routes: readonly string\[\] = \[([^\]]*)\]/.exec(
    source,
  )?.[1];
  const listed =
    block === undefined
      ? []
      : [...block.matchAll(/^\s*"([^"]+)",$/gm)].map((match) => match[1]);
  return listed.length > 0 ? listed : ["/"];
}

function pascal(kind) {
  return kind
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function givePort(app, port) {
  const path = join(app, "package.json");
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.config = { ...manifest.config, port };
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

function checkApp(name, app, routes, { e2e, clean = true }) {
  for (const script of ["typecheck", "lint", "build"]) {
    step(name, script, run("pnpm", ["run", script], app));
  }
  if (e2e) {
    step(name, "its e2e specs", run("pnpm", ["run", "test:e2e"], app));
  }
  const checked = run(
    process.execPath,
    [
      cli,
      "check",
      ...routes,
      "--json",
      "--engine",
      "chromium",
      "--engine",
      "webkit",
      ...(full ? ["--full"] : []),
    ],
    app,
  );
  const found = [
    ...new Set(
      parsedArray(checked.stdout).map(
        (violation) =>
          `${violation.rule} on ${violation.page}: ${violation.message}`,
      ),
    ),
  ];
  if (clean) {
    step(name, `buttery check on ${String(routes.length)} pages`, {
      ok: checked.ok,
      output: found.length > 0 ? found.join("\n") : checked.output,
    });
    return;
  }
  const ran = checked.stdout.trimStart().startsWith("[");
  step(
    name,
    `buttery check runs and reports ${String(found.length)} problems in markup that isn't buttery's yet`,
    { ok: ran, output: checked.output },
  );
  for (const problem of found) process.stdout.write(`    ${problem}\n`);
}

/**
 * Whether the packages installed in `app` ship their docs: `llms.txt`, `llms-full.txt`, `tokens.json` and
 * every page in `@butteryui/core`, each link between them reaching its file, and each example
 * `@butteryui/react`'s `manifest.json` names, with the MCP server's knowledge beside it.
 */
function shippedDocs(app) {
  const core = join(app, "node_modules/@butteryui/core/dist");
  const react = join(app, "node_modules/@butteryui/react/dist");
  const missing = [
    join(core, "llms.txt"),
    join(core, "llms-full.txt"),
    join(core, "tokens.json"),
    join(react, "manifest.json"),
    join(react, "knowledge.json"),
  ]
    .filter((file) => !existsSync(file))
    .map((file) => `no ${relative(app, file)}`);
  const pages = globSync("docs/**/*.md", { cwd: core });
  for (const file of ["llms.txt", "llms-full.txt", ...pages]) {
    if (!existsSync(join(core, file))) continue;
    for (const [, href = ""] of readFileSync(join(core, file), "utf8").matchAll(
      /\]\(([^)\s#]+)(?:#[^)\s]*)?\)/g,
    )) {
      if (
        !/^[a-z]+:/.test(href) &&
        !existsSync(join(core, dirname(file), href))
      ) {
        missing.push(`${file} links to ${href}, which isn't there`);
      }
    }
  }
  const examples = existsSync(join(react, "manifest.json"))
    ? JSON.parse(
        readFileSync(join(react, "manifest.json"), "utf8"),
      ).components.flatMap((component) =>
        component.examples.map((example) => example.file),
      )
    : [];
  for (const file of examples) {
    if (!existsSync(join(react, file))) missing.push(`no ${file}`);
  }
  return {
    ok: missing.length === 0 && pages.length > 0 && examples.length > 0,
    output: `${String(pages.length)} pages and ${String(examples.length)} examples.\n${missing.join("\n")}`,
  };
}

if (
  !step(
    "packages",
    "build",
    run("pnpm", ["-r", "--filter", "./packages/*", "build"], root),
  )
) {
  process.exit(1);
}
mkdirSync(tarballs);
for (const name of readdirSync(join(root, "packages"))) {
  step(
    name,
    "pack",
    run(
      "pnpm",
      ["pack", "--pack-destination", tarballs],
      join(root, "packages", name),
    ),
  );
}
const env = {
  BUTTERY_TARBALLS: tarballs,
  npm_config_user_agent: `pnpm/${run("pnpm", ["--version"], root).stdout.trim()}`,
};
const kinds = Object.keys(
  JSON.parse(readFileSync(join(root, "packages/cli/dist/pages.json"), "utf8")),
);

for (const [index, template] of templates.entries()) {
  const app = join(work, template);
  const maker =
    template === "marketing"
      ? [createButtery, app, "--template", template]
      : [cli, "create", app, "--template", template];
  if (
    !step(
      template,
      `${template === "marketing" ? "create-buttery" : "buttery create"} and install`,
      run(process.execPath, maker, work, env),
    )
  ) {
    continue;
  }
  // Its own port, since anything may be using the template's 5173 on this machine.
  givePort(app, 5400 + index);
  checkApp(template, app, routesOf(app), { e2e: true });
  if (template !== "dashboard") continue;
  for (const kind of kinds) {
    step(
      "dashboard",
      `add page ${kind}`,
      run(
        process.execPath,
        [cli, "add", "page", kind, "--name", `${pascal(kind)}Sample`],
        app,
      ),
    );
  }
  step(
    "dashboard",
    "create component OrderCard",
    run(
      process.execPath,
      [
        cli,
        "create",
        "component",
        "OrderCard",
        "--purpose",
        "One order, as a card.",
      ],
      app,
    ),
  );
  checkApp(
    "dashboard with every page added",
    app,
    [...routesOf(app), "/src/components/OrderCard/preview.html"],
    { e2e: true },
  );
}

const plain = join(work, "plain-react");
const files = {
  "package.json": `${JSON.stringify(
    {
      name: "plain-react",
      private: true,
      type: "module",
      config: { port: 5480 },
      scripts: {
        dev: "vite --port 5480 --strictPort",
        build: "vite build",
        typecheck: "tsc --noEmit",
      },
      dependencies: { react: "^19.3.1", "react-dom": "^19.3.1" },
      devDependencies: {
        "@types/react": "^19.3.0",
        "@types/react-dom": "^19.3.0",
        "@vitejs/plugin-react": "^6.1.2",
        typescript: "6.0.3",
        vite: "^8.3.4",
      },
    },
    null,
    2,
  )}\n`,
  "index.html":
    '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Plain React</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
  "vite.config.ts":
    'import react from "@vitejs/plugin-react";\nimport { defineConfig } from "vite";\n\nexport default defineConfig({ plugins: [react()] });\n',
  "tsconfig.json": `${JSON.stringify(
    {
      compilerOptions: {
        target: "es2024",
        lib: ["es2024", "dom", "dom.iterable"],
        module: "preserve",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        types: ["vite/client"],
        strict: true,
        allowImportingTsExtensions: true,
        noEmit: true,
        skipLibCheck: true,
      },
      include: ["src"],
    },
    null,
    2,
  )}\n`,
  "src/main.tsx":
    'import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport { App } from "./App.tsx";\n\nconst container = document.getElementById("root");\nif (!container) throw new Error("No #root.");\n\ncreateRoot(container).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);\n',
  "src/App.tsx":
    'import type { ReactElement } from "react";\n\nexport function App(): ReactElement {\n  return (\n    <main>\n      <h1>Plant shop</h1>\n      <p>Plants for small rooms, delivered on Saturdays.</p>\n    </main>\n  );\n}\n',
};
for (const [file, text] of Object.entries(files)) {
  mkdirSync(dirname(join(plain, file)), { recursive: true });
  writeFileSync(join(plain, file), text);
}
if (
  step("plain-react", "install", run("pnpm", ["install"], plain, env)) &&
  step(
    "plain-react",
    "buttery init",
    run(process.execPath, [cli, "init"], plain, env),
  )
) {
  step(
    "plain-react",
    "buttery doctor",
    run(process.execPath, [cli, "doctor"], plain),
  );
  step(
    "plain-react",
    "its packages ship their docs, manifest.json and examples",
    shippedDocs(plain),
  );
  step(
    "plain-react",
    "buttery init again changes nothing",
    (() => {
      const again = run(process.execPath, [cli, "init"], plain, env);
      return {
        ok: again.ok && again.stdout.includes("already set up"),
        output: again.output,
      };
    })(),
  );
  checkApp("plain-react", plain, ["/"], { e2e: false, clean: false });
}

process.stdout.write(
  failures.length === 0
    ? `\nEvery app passed. They're in ${work}.\n`
    : `\n${String(failures.length)} failed, in ${work}:\n${failures.map((failure) => `  ${failure}`).join("\n")}\n`,
);
process.exitCode = failures.length === 0 ? 0 : 1;
