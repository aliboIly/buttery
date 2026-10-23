#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  globSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

const json = process.argv.includes("--reporter=json");
const passthrough = process.argv
  .slice(2)
  .filter((arg) => arg !== "--reporter=json");

rmSync("test-results", { recursive: true, force: true });
const reportDir = mkdtempSync(join(tmpdir(), "buttery-layout-"));
const reportFile = join(reportDir, "playwright.json");

const run = spawnSync(
  process.execPath,
  [
    "--conditions=@butteryui/source",
    "node_modules/@playwright/test/cli.js",
    "test",
    "layout.spec",
    "--reporter",
    json ? "dot,json" : "list",
    ...passthrough,
  ],
  {
    stdio: json ? ["inherit", "ignore", "inherit"] : "inherit",
    env: {
      ...process.env,
      BUTTERY_MATRIX: "full",
      PLAYWRIGHT_JSON_OUTPUT_FILE: reportFile,
    },
  },
);

/** Failed tests whose error isn't a layout report, such as a page that never settles or a crash. */
function failuresOf(suite, titles = []) {
  const path = suite.title ? [...titles, suite.title] : titles;
  const own = (suite.specs ?? []).flatMap((spec) =>
    spec.tests.flatMap((entry) =>
      entry.results
        .filter(
          (result) => result.status !== "passed" && result.status !== "skipped",
        )
        .map((result) => ({
          test: [...path, spec.title].join(" › "),
          project: entry.projectName,
          status: result.status,
          error: (result.error?.message ?? "")
            .split("\n")[0]
            .replace(/^Error: /, ""),
        }))
        .filter((failure) => !failure.error.startsWith("buttery found")),
    ),
  );
  return [
    ...own,
    ...(suite.suites ?? []).flatMap((child) => failuresOf(child, path)),
  ];
}

if (json) {
  const violations = globSync(
    "test-results/**/buttery-violations.json",
  ).flatMap((file) => JSON.parse(readFileSync(file, "utf8")));
  const failures = existsSync(reportFile)
    ? JSON.parse(readFileSync(reportFile, "utf8")).suites.flatMap((suite) =>
        failuresOf(suite),
      )
    : [
        {
          test: "layout.spec",
          status: "failed",
          error: "Playwright wrote no report",
        },
      ];
  process.stdout.write(
    `${JSON.stringify({ passed: run.status === 0, violations, failures }, null, 2)}\n`,
  );
}

rmSync(reportDir, { recursive: true, force: true });
process.exitCode = run.status ?? 1;
