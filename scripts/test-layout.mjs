#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { globSync, readFileSync, rmSync } from "node:fs";
import process from "node:process";

const json = process.argv.includes("--reporter=json");
const passthrough = process.argv
  .slice(2)
  .filter((arg) => arg !== "--reporter=json");

rmSync("test-results", { recursive: true, force: true });

const run = spawnSync(
  process.execPath,
  [
    "--conditions=@buttery/source",
    "node_modules/@playwright/test/cli.js",
    "test",
    "layout.spec",
    "--reporter",
    json ? "dot" : "list",
    ...passthrough,
  ],
  {
    stdio: json ? ["inherit", "ignore", "inherit"] : "inherit",
    env: { ...process.env, BUTTERY_MATRIX: "full" },
  },
);

if (json) {
  const violations = globSync(
    "test-results/**/buttery-violations.json",
  ).flatMap((file) => JSON.parse(readFileSync(file, "utf8")));
  process.stdout.write(
    `${JSON.stringify({ passed: run.status === 0, violations }, null, 2)}\n`,
  );
}

process.exitCode = run.status ?? 1;
