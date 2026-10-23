import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { releaseId } from "../src/release.ts";
import type { Heading } from "./frontmatter.ts";
import type { Release } from "./whats-new.ts";

/** One line of the roadmap: what it is, as Markdown, and whether it has landed. */
export interface RoadmapItem {
  readonly text: string;
  readonly done: boolean;
}

/** Where a release stands: every box ticked, the first with boxes left, or one after it. */
export type RoadmapStage = "shipped" | "now" | "planned";

/** One release on the roadmap, from its heading in `ROADMAP.md` and the boxes under it. */
export interface RoadmapRelease {
  /** As `x.y.z`, such as `0.9.0` for the heading's `v0.9`. */
  readonly version: string;
  /** Its name, such as "App kit". */
  readonly title: string;
  /** The build plan's phase it is, such as "Phase 6B"; empty when the heading names none. */
  readonly phase: string;
  /** What it's for, from the quoted line under its heading; empty without one. */
  readonly summary: string;
  readonly items: readonly RoadmapItem[];
  /** Shipped with every box ticked, `now` for the first release with boxes left, planned after it. */
  readonly stage: RoadmapStage;
}

/** `ROADMAP.md` as the Roadmap page shows it. */
export interface Roadmap {
  /** Oldest first, as the file lists them. */
  readonly releases: readonly RoadmapRelease[];
  /** The ideas under "Later" that haven't landed: not commitments. */
  readonly later: readonly RoadmapItem[];
}

const RELEASE =
  /^## v(\d+)\.(\d+)(?:\.(\d+))?\s+—\s+(.+?)(?:\s+\(([^)]+)\))?\s*$/;
const ITEM = /^- \[( |x)\] (.+)$/;

/** The releases and the later ideas in `ROADMAP.md`'s text. */
export function parseRoadmap(markdown: string): Roadmap {
  const releases: {
    version: string;
    title: string;
    phase: string;
    summary: string;
    items: RoadmapItem[];
  }[] = [];
  const later: RoadmapItem[] = [];
  let items: RoadmapItem[] | undefined;
  let current: (typeof releases)[number] | undefined;
  for (const line of markdown.split("\n")) {
    const release = RELEASE.exec(line);
    if (release) {
      const [, major, minor, patch, title, phase] = release;
      current = {
        version: `${major ?? "0"}.${minor ?? "0"}.${patch ?? "0"}`,
        title: title ?? "",
        phase: phase ?? "",
        summary: "",
        items: [],
      };
      releases.push(current);
      items = current.items;
      continue;
    }
    if (line.startsWith("## ")) {
      current = undefined;
      items = /^## Later\b/.test(line) ? later : undefined;
      continue;
    }
    const quote = /^> (.+)$/.exec(line)?.[1];
    if (current && quote !== undefined && current.items.length === 0) {
      current.summary = quote.trim();
      continue;
    }
    const item = ITEM.exec(line);
    if (items && item)
      items.push({ text: item[2] ?? "", done: item[1] === "x" });
  }
  const now = releases.findIndex((release) =>
    release.items.some((item) => !item.done),
  );
  return {
    releases: releases.map((release, index) => ({
      ...release,
      stage:
        now === -1 || index < now
          ? "shipped"
          : index === now
            ? "now"
            : "planned",
    })),
    later: later.filter((idea) => !idea.done),
  };
}

/** The Roadmap page's headings for the parts it has: Now, Next, Later and Shipped. */
export function roadmapHeadings(roadmap: Roadmap): Heading[] {
  const has = (stage: RoadmapStage): boolean =>
    roadmap.releases.some((release) => release.stage === stage);
  return [
    ...(has("now") ? [{ depth: 2 as const, text: "Now", id: "now" }] : []),
    ...(has("planned")
      ? [{ depth: 2 as const, text: "Next", id: "next" }]
      : []),
    ...(roadmap.later.length > 0
      ? [{ depth: 2 as const, text: "Later", id: "later" }]
      : []),
    ...(has("shipped")
      ? [{ depth: 2 as const, text: "Shipped", id: "shipped" }]
      : []),
  ];
}

/** `ROADMAP.md` at the repository's root, read. */
export function roadmapIn(root: string): Roadmap {
  return parseRoadmap(readFileSync(join(root, "ROADMAP.md"), "utf8"));
}

/**
 * The Roadmap as Markdown: the release being built with its boxes, the ones planned after it, the ideas for
 * later, and every shipped release with the name and date What's new gives it.
 */
export function roadmapMarkdown(
  roadmap: Roadmap,
  releases: readonly Release[],
): string {
  const section = (stage: RoadmapStage): RoadmapRelease[] =>
    roadmap.releases.filter((release) => release.stage === stage);
  const box = (item: RoadmapItem): string =>
    `- [${item.done ? "x" : " "}] ${item.text}`;
  const building = section("now").flatMap((release) => {
    const done = release.items.filter((item) => item.done).length;
    return [
      `## Now: ${release.version}, ${release.title}`,
      "",
      ...(release.summary === "" ? [] : [release.summary, ""]),
      `${String(done)} of ${String(release.items.length)} done.`,
      "",
      ...release.items.map(box),
      "",
    ];
  });
  const planned = section("planned").flatMap((release) => [
    `## Next: ${release.version}, ${release.title}`,
    "",
    ...(release.summary === "" ? [] : [release.summary, ""]),
    ...release.items.map(box),
    "",
  ]);
  const later =
    roadmap.later.length === 0
      ? []
      : [
          "## Later",
          "",
          "Ideas, not commitments.",
          "",
          ...roadmap.later.map((idea) => `- ${idea.text}`),
          "",
        ];
  const shipped = section("shipped")
    .reverse()
    .map((release) => {
      const notes = releases.find(
        (candidate) => candidate.version === release.version,
      );
      return notes
        ? `- [${release.version}: ${notes.title}](/resources/whats-new#${releaseId(release.version)}) (${notes.date})`
        : `- ${release.version}: ${release.title}`;
    });
  return [
    ...building,
    ...planned,
    ...later,
    ...(shipped.length === 0 ? [] : ["## Shipped", "", ...shipped]),
  ]
    .join("\n")
    .trim();
}

const ROADMAP_MODULE = "virtual:buttery-roadmap";

/** Serves `virtual:buttery-roadmap`: `ROADMAP.md`'s releases and later ideas. */
export function butteryRoadmap(root: string): Plugin {
  return {
    name: "buttery-docs-roadmap",
    resolveId(source) {
      return source === ROADMAP_MODULE ? `\0${ROADMAP_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${ROADMAP_MODULE}`) return undefined;
      this.addWatchFile(join(root, "ROADMAP.md"));
      return `export const roadmap = ${JSON.stringify(roadmapIn(root))};`;
    },
  };
}
