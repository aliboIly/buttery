#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import process from "node:process";

const PRIVATE_PATHS = ["reference", "PROMPTS.md"];

const tracked = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--", ...PRIVATE_PATHS],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);

if (tracked.length > 0) {
  process.stderr.write(
    [
      "These files are private build material and must never be tracked:",
      ...tracked.map((path) => `  ${path}`),
      `Fix: git rm -r --cached ${PRIVATE_PATHS.join(" ")}`,
      "",
    ].join("\n"),
  );
  process.exitCode = 1;
}
