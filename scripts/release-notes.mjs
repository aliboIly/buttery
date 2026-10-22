#!/usr/bin/env node
import { globSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { releaseId } from "../apps/docs/src/release.ts";
import { releasesIn } from "../apps/docs/vite/whats-new.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

/** The components whose page says they arrived in `version`, by name, from their `*.playground.tsx`. */
export function arrivalsIn(repository, version) {
  return globSync("packages/*/src/**/*.playground.tsx", { cwd: repository })
    .filter((file) => {
      const since = /since:\s*"([^"]+)"/.exec(
        readFileSync(join(repository, file), "utf8"),
      )?.[1];
      return since === version;
    })
    .map((file) => basename(file, ".playground.tsx"))
    .sort((a, b) => a.localeCompare(b));
}

/** A release's title on GitHub, such as "v0.9.0: The docs site". */
export function releaseTitle(release) {
  return `v${release.version}: ${release.title}`;
}

/**
 * A release's notes for GitHub, from its What's new entry: what it's for, its highlights, the components it
 * brought, every change its packages' changelogs list, and a link to its notes on the docs site.
 */
export function releaseNotes(release, arrivals, docs) {
  return [
    ...(release.summary === "" ? [] : [release.summary, ""]),
    ...release.highlights.map((highlight) => `- ${highlight}`),
    ...(arrivals.length === 0
      ? []
      : [
          "",
          `New components: ${arrivals.map((name) => `\`${name}\``).join(", ")}.`,
        ]),
    ...release.changes.flatMap(({ packageName, lines }) => [
      "",
      `### ${packageName}`,
      "",
      ...lines.map((line) => `- ${line}`),
    ]),
    "",
    `[The release notes on the docs site](${docs}/resources/whats-new#${releaseId(release.version)})`,
  ].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [version, flag] = process.argv.slice(2);
  const releases = releasesIn(root);
  const release = releases.find((candidate) => candidate.version === version);
  if (!release) {
    console.error(
      `What's new has no entry for ${String(version)}. Fix: add apps/docs/content/whats-new/${String(version)}.md before tagging v${String(version)}.`,
    );
    process.exit(1);
  }
  const output =
    flag === "--title"
      ? releaseTitle(release)
      : flag === "--newest"
        ? String(releases[0]?.version === release.version)
        : releaseNotes(
            release,
            arrivalsIn(root, version),
            process.env.DOCS_URL ?? "https://aliboily.github.io/buttery",
          );
  process.stdout.write(`${output}\n`);
}
