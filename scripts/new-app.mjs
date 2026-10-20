#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";

const STARTER = join("apps", "starter");

function fail(message) {
  process.stderr.write(`new-app: ${message}\n`);
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function replaceOnce(file, text, from, to) {
  if (!text.includes(from)) {
    fail(
      `${file} no longer contains ${JSON.stringify(from)}. Update scripts/new-app.mjs to match apps/starter.`,
    );
  }
  return text.replace(from, to);
}

function isSkipped(path) {
  const posix = path.split(sep).join("/");
  return (
    /(?:^|\/)(?:node_modules|dist|\.tsbuild)(?:\/|$)/.test(posix) ||
    /^src-tauri\/(?:target|gen)(?:\/|$)/.test(posix)
  );
}

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
  fail('give the app a kebab-case name, e.g. "pnpm new-app card-studio".');
}
const target = join("apps", name);
if (existsSync(target)) fail(`apps/${name} already exists.`);

const ports = readdirSync("apps", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(
    (entry) => readJson(join("apps", entry.name, "package.json")).config?.port,
  )
  .filter((port) => typeof port === "number");
const port = Math.max(...ports) + 1;
const title = name.replaceAll("-", " ");

cpSync(STARTER, target, {
  recursive: true,
  filter: (source) => !isSkipped(relative(STARTER, source)),
});

const manifest = readJson(join(target, "package.json"));
writeJson(join(target, "package.json"), {
  ...manifest,
  name,
  config: { ...manifest.config, port },
});

for (const [file, from, to] of [
  ["index.html", "<title>buttery starter</title>", `<title>${title}</title>`],
  ["src/App.tsx", "🧈 buttery starter", `🧈 ${title}`],
  ["e2e/smoke.spec.ts", '"🧈 buttery starter"', `"🧈 ${title}"`],
]) {
  const path = join(target, file);
  writeFileSync(path, replaceOnce(file, readFileSync(path, "utf8"), from, to));
}

const tauriPath = join(target, "src-tauri", "tauri.conf.json");
const tauri = readJson(tauriPath);
const [window, ...otherWindows] = tauri.app.windows;
writeJson(tauriPath, {
  ...tauri,
  productName: title,
  identifier: `dev.buttery.${name}`,
  build: { ...tauri.build, devUrl: `http://localhost:${port}` },
  app: { ...tauri.app, windows: [{ ...window, title }, ...otherWindows] },
});

const solution = readJson("tsconfig.json");
writeJson("tsconfig.json", {
  ...solution,
  references: [...solution.references, { path: `./apps/${name}` }],
});

execFileSync(
  "pnpm",
  ["exec", "prettier", "--write", "--log-level=warn", target, "tsconfig.json"],
  {
    stdio: "inherit",
  },
);
execFileSync("pnpm", ["install"], { stdio: "inherit" });

process.stdout.write(
  [
    `Created apps/${name} (dev server on port ${port}).`,
    `  pnpm --filter ${name} dev`,
    `  pnpm --filter ${name} tauri dev`,
    "",
  ].join("\n"),
);
