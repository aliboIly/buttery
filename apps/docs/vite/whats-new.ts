import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";
import { minorOf, releaseId } from "../src/release.ts";
import { slugify } from "../src/slug.ts";
import { parseFrontmatter, splitFrontmatter } from "./frontmatter.ts";
import type { Heading } from "./frontmatter.ts";

/** What one package's changelog says changed in a release. */
export interface ReleaseChanges {
  readonly packageName: string;
  /** Each change's summary as Changesets wrote it, without its commit. */
  readonly lines: readonly string[];
}

/**
 * One release as What's new shows it: its version, date and name, what it's for, the examples that show it,
 * two or three highlights, and every change.
 */
export interface Release {
  readonly version: string;
  /** As `YYYY-MM-DD`. */
  readonly date: string;
  readonly title: string;
  /** What the release is for, in a sentence of Markdown. */
  readonly summary: string;
  /**
   * The examples that show what it brought, each a component's name and an example's file name, such as
   * `"OverflowCluster/text-toolbar"`; empty for a release with nothing to try.
   */
  readonly examples: readonly string[];
  /** Each a sentence of Markdown, such as "`Button` with four variants". */
  readonly highlights: readonly string[];
  /** The changes the packages' changelogs list for this version, once Changesets has written them. */
  readonly changes: readonly ReleaseChanges[];
}

function versionParts(version: string): number[] {
  return version.split(".").map(Number);
}

/** Newest first, comparing versions part by part, so 0.10.0 comes before 0.9.0 and 0.4.5 between 0.5.0 and 0.4.0. */
export function newestFirst(a: string, b: string): number {
  const left = versionParts(a);
  const right = versionParts(b);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (right[index] ?? 0) - (left[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** Every package's `CHANGELOG.md`, which `changeset version` writes beside its `package.json`. */
export function changelogFiles(root: string): string[] {
  return globSync("packages/*/CHANGELOG.md", { cwd: root })
    .sort()
    .map((file) => join(root, file));
}

/**
 * The changes a Changesets changelog lists under each version, by version: each top-level bullet's first
 * line without its commit hash. "Updated dependencies" bullets are left out.
 */
export function changelogVersions(markdown: string): Map<string, string[]> {
  const versions = new Map<string, string[]>();
  let lines: string[] | undefined;
  for (const line of markdown.split("\n")) {
    const version = /^## (\d+\.\d+\.\d+\S*)\s*$/.exec(line)?.[1];
    if (version !== undefined) {
      lines = [];
      versions.set(version, lines);
      continue;
    }
    const change = /^- (?:[0-9a-f]{7,40}: )?(.+)$/.exec(line)?.[1];
    if (
      lines !== undefined &&
      change !== undefined &&
      !change.startsWith("Updated dependencies")
    )
      lines.push(change);
  }
  return versions;
}

function packageNameOf(changelog: string): string {
  const manifest = join(dirname(changelog), "package.json");
  if (!existsSync(manifest)) return dirname(changelog);
  const data: unknown = JSON.parse(readFileSync(manifest, "utf8"));
  return typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof data.name === "string"
    ? data.name
    : dirname(changelog);
}

/**
 * What's new entry `file`'s fields: its frontmatter's version, date, title, summary and examples, and its
 * body's bullets.
 */
export function entryOf(file: string): Omit<Release, "changes"> {
  const { block, body } = splitFrontmatter(readFileSync(file, "utf8"));
  const data = block === null ? {} : parseFrontmatter(block, file);
  const text = (key: string): string => {
    const value = data[key];
    return typeof value === "string" ? value : String(value ?? "");
  };
  const examples = data["examples"] ?? [];
  return {
    version: text("version"),
    date: text("date"),
    title: text("title"),
    summary: text("summary"),
    examples: (Array.isArray(examples) ? examples : [examples]).map(String),
    highlights: [...body.matchAll(/^- (.+)$/gm)].map(([, line]) => line ?? ""),
  };
}

/** Every release with an entry in `folder`, newest first, with what each changelog in `changelogs` lists for it. */
export function readReleases(
  folder: string,
  changelogs: readonly string[],
): Release[] {
  const logs = changelogs.map((file) => ({
    packageName: packageNameOf(file),
    versions: changelogVersions(readFileSync(file, "utf8")),
  }));
  return globSync("*.md", { cwd: folder })
    .map((file) => {
      const entry = entryOf(join(folder, file));
      return {
        ...entry,
        changes: logs.flatMap(({ packageName, versions }) => {
          const lines = versions.get(entry.version) ?? [];
          return lines.length > 0 ? [{ packageName, lines }] : [];
        }),
      };
    })
    .sort((a, b) => newestFirst(a.version, b.version));
}

/** Every release in `apps/docs/content/whats-new`, newest first, with the packages' changelogs. */
export function releasesIn(root: string): Release[] {
  return readReleases(
    join(root, "apps/docs/content/whats-new"),
    changelogFiles(root),
  );
}

/** What's new as Markdown: each release's version, name and date, what it's for, its highlights, and every change. */
export function releasesMarkdown(releases: readonly Release[]): string {
  return releases
    .map((release) =>
      [
        `## ${release.version}: ${release.title}`,
        "",
        release.date,
        "",
        ...(release.summary === "" ? [] : [release.summary, ""]),
        ...release.highlights.map((highlight) => `- ${highlight}`),
        ...release.changes.flatMap(({ packageName, lines }) => [
          "",
          `### ${packageName}`,
          "",
          ...lines.map((line) => `- ${line}`),
        ]),
      ].join("\n"),
    )
    .join("\n\n");
}

/** The heading each release's notes open with on What's new: its number and name, linking to `releaseId`. */
export function releaseHeadings(releases: readonly Release[]): Heading[] {
  return releases.map((release) => ({
    depth: 2,
    text: `${release.version} ${release.title}`,
    id: releaseId(release.version),
  }));
}

/** The heading the newest release opens with on the Introduction: "New in" and its minor number. */
export function latestReleaseHeadings(releases: readonly Release[]): Heading[] {
  const latest = releases[0];
  if (!latest) return [];
  const text = `New in ${minorOf(latest.version)}`;
  return [{ depth: 2, text, id: slugify(text) }];
}

/**
 * The newest release as the Introduction's Markdown writes it: "New in" and its number, what it's for, its
 * highlights, and links to its release notes and the roadmap.
 */
export function latestReleaseMarkdown(release: Release): string {
  return [
    `## New in ${minorOf(release.version)}`,
    "",
    ...(release.summary === "" ? [] : [release.summary, ""]),
    ...release.highlights.map((highlight) => `- ${highlight}`),
    "",
    `[Release notes for ${release.version}](/resources/whats-new#${releaseId(release.version)}) and [what comes next](/resources/roadmap).`,
  ].join("\n");
}

const WHATS_NEW_MODULE = "virtual:buttery-whats-new";

/** Serves `virtual:buttery-whats-new`: every release in `content/whats-new`, newest first. */
export function butteryWhatsNew(root: string): Plugin {
  return {
    name: "buttery-docs-whats-new",
    resolveId(source) {
      return source === WHATS_NEW_MODULE ? `\0${WHATS_NEW_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${WHATS_NEW_MODULE}`) return undefined;
      for (const file of [
        ...globSync("apps/docs/content/whats-new/*.md", { cwd: root }).map(
          (path) => join(root, path),
        ),
        ...changelogFiles(root),
      ])
        this.addWatchFile(file);
      return `export const releases = ${JSON.stringify(releasesIn(root))};`;
    },
  };
}
