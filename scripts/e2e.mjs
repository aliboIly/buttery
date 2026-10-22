#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import process from "node:process";

const [group, ...rest] = process.argv.slice(2);
if (group !== "rest" && group !== "timing") {
  process.stderr.write(
    'Usage: node scripts/e2e.mjs rest|timing [playwright args]. Fix: pass "rest" for the specs that don\'t time motion, "timing" for those that do.\n',
  );
  process.exit(2);
}
const result = spawnSync(
  process.execPath,
  [
    "--conditions=@buttery/source",
    "node_modules/@playwright/test/cli.js",
    "test",
    ...rest,
  ],
  { stdio: "inherit", env: { ...process.env, BUTTERY_E2E: group } },
);
process.exitCode = result.status ?? 1;
