#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";

const inWorkTree =
  spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" })
    .status === 0;

if (inWorkTree) {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"]);
}
