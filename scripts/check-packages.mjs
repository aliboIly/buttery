#!/usr/bin/env node
import { existsSync, globSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** Every file a manifest's `exports` and `bin` send importers to, skipping the source condition, which isn't published. */
export function publishedTargets(manifest) {
  const targets = [];
  const visit = (value, condition) => {
    if (condition === "@butteryui/source") return;
    if (typeof value === "string") {
      targets.push(value);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, inner] of Object.entries(value)) visit(inner, key);
    }
  };
  visit(manifest.exports, null);
  if (typeof manifest.bin === "string") targets.push(manifest.bin);
  else if (manifest.bin) targets.push(...Object.values(manifest.bin));
  return targets;
}

/**
 * The published targets of the package in `dir` that don't exist, as `name: target` lines; a pattern such as
 * `./dist/docs/*` has to match a file.
 */
export function missingTargets(dir) {
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (manifest.private === true) return [];
  return publishedTargets(manifest)
    .filter((target) =>
      target.includes("*")
        ? globSync(target.replace(/^\.\//, "").replace(/\*/g, "**/*"), {
            cwd: dir,
          }).length === 0
        : !existsSync(join(dir, target)),
    )
    .map((target) => `${String(manifest.name)}: ${target}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
  const packages = join(root, "packages");
  const missing = readdirSync(packages, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(join(packages, entry.name, "package.json")),
    )
    .flatMap((entry) => missingTargets(join(packages, entry.name)));
  if (missing.length > 0) {
    process.stderr.write(
      `These files that a package's exports or bin name weren't built:\n${missing.map((line) => `  ${line}`).join("\n")}\nFix: make the build write them (tsdown writes .mjs for platform "node" unless fixedExtension is false), or point the manifest at what it writes.\n`,
    );
    process.exit(1);
  }
  process.stdout.write(
    "Every file the packages' exports and bins name was built.\n",
  );
}
