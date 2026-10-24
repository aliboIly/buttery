#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";

/** Where the `buttery` command this package depends on starts, from its manifest's `bin`. */
function butteryBin(): string {
  const manifestPath = createRequire(import.meta.url).resolve(
    "@butteryui/cli/package.json",
  );
  const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
  const bin: unknown =
    typeof manifest === "object" && manifest !== null
      ? Reflect.get(manifest, "bin")
      : undefined;
  const path: unknown =
    typeof bin === "object" && bin !== null ? Reflect.get(bin, "buttery") : bin;
  if (typeof path !== "string") {
    throw new Error("@butteryui/cli has no buttery command.");
  }
  return join(dirname(manifestPath), path);
}

const result = spawnSync(
  process.execPath,
  [butteryBin(), "create", ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
