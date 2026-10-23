import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  changelogVersions,
  latestReleaseHeadings,
  latestReleaseMarkdown,
  newestFirst,
  readReleases,
  releaseHeadings,
  releasesIn,
  releasesMarkdown,
} from "./whats-new.ts";
import type { Release } from "./whats-new.ts";

const STEPPERS: Release = {
  version: "0.10.0",
  date: "2026-11-02",
  title: "Steppers",
  summary: "Short flows, one step at a time.",
  examples: ["Stepper/checkout"],
  highlights: ["A `Stepper`.", "Button shapes."],
  changes: [],
};

const root = fileURLToPath(new URL("../../..", import.meta.url));

const CHANGELOG = `# @butteryui/react

## 0.10.0

### Minor Changes

- 1a2b3c4: Add the Stepper component.
- Give Button a \`shape\` prop.

### Patch Changes

- Updated dependencies [1a2b3c4]
  - @butteryui/core@0.10.0

## 0.9.0

### Patch Changes

- 9f8e7d6c: Fix the slider's focus ring.
`;

const temporary: string[] = [];

afterEach(() => {
  for (const folder of temporary.splice(0))
    rmSync(folder, { recursive: true, force: true });
});

function scratch(): string {
  const folder = mkdtempSync(join(tmpdir(), "buttery-whats-new-"));
  temporary.push(folder);
  return folder;
}

describe("What's new", () => {
  it("reads every release on the site newest first", () => {
    const versions = releasesIn(root).map((release) => release.version);
    expect(versions).toEqual([...versions].sort((a, b) => newestFirst(a, b)));
    expect(versions[0]).toBe("0.10.0");
  });

  it("orders versions part by part, so 0.10.0 is newer than 0.9.0 and a patch sits between its neighbours", () => {
    expect(
      ["0.4.0", "0.10.0", "0.4.5", "0.9.0", "0.5.0"].sort(newestFirst),
    ).toEqual(["0.10.0", "0.9.0", "0.5.0", "0.4.5", "0.4.0"]);
  });

  it("gives every release on the site a date, a title and two or three highlights", () => {
    for (const release of releasesIn(root)) {
      expect(release.date, release.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(release.title, release.version).not.toBe("");
      expect(release.highlights.length, release.version).toBeGreaterThanOrEqual(
        2,
      );
      expect(release.highlights.length, release.version).toBeLessThanOrEqual(3);
    }
  });

  it("reads a Changesets changelog's changes by version, without commits or dependency bumps", () => {
    expect(Object.fromEntries(changelogVersions(CHANGELOG))).toEqual({
      "0.10.0": ["Add the Stepper component.", "Give Button a `shape` prop."],
      "0.9.0": ["Fix the slider's focus ring."],
    });
  });

  it("gives each release the changes every package's changelog lists for its version", () => {
    const folder = scratch();
    mkdirSync(join(folder, "whats-new"));
    writeFileSync(
      join(folder, "whats-new", "0.10.0.md"),
      "---\nversion: 0.10.0\ndate: 2026-11-02\ntitle: Steppers\nsummary: Short flows, one step at a time.\nexamples: [Stepper/checkout, Button/shapes]\n---\n\n- A `Stepper`.\n- Button shapes.\n",
    );
    mkdirSync(join(folder, "react"));
    writeFileSync(
      join(folder, "react", "package.json"),
      JSON.stringify({ name: "@butteryui/react" }),
    );
    writeFileSync(join(folder, "react", "CHANGELOG.md"), CHANGELOG);
    const [release] = readReleases(join(folder, "whats-new"), [
      join(folder, "react", "CHANGELOG.md"),
    ]);
    expect(release).toEqual({
      version: "0.10.0",
      date: "2026-11-02",
      title: "Steppers",
      summary: "Short flows, one step at a time.",
      examples: ["Stepper/checkout", "Button/shapes"],
      highlights: ["A `Stepper`.", "Button shapes."],
      changes: [
        {
          packageName: "@butteryui/react",
          lines: ["Add the Stepper component.", "Give Button a `shape` prop."],
        },
      ],
    });
  });

  it("writes each release as Markdown: its version and name, date, summary, highlights and changes", () => {
    expect(
      releasesMarkdown([
        {
          version: "0.10.0",
          date: "2026-11-02",
          title: "Steppers",
          summary: "Short flows, one step at a time.",
          examples: ["Stepper/checkout"],
          highlights: ["A `Stepper`."],
          changes: [
            {
              packageName: "@butteryui/react",
              lines: ["Add the Stepper component."],
            },
          ],
        },
      ]),
    ).toBe(
      "## 0.10.0: Steppers\n\n2026-11-02\n\nShort flows, one step at a time.\n\n- A `Stepper`.\n\n### @butteryui/react\n\n- Add the Stepper component.",
    );
  });

  it("heads each release's notes with its number and name, linking to its id", () => {
    expect(releaseHeadings([STEPPERS])).toEqual([
      { depth: 2, text: "0.10.0 Steppers", id: "release-0-10-0" },
    ]);
  });

  it("heads the Introduction's newest release with its minor number", () => {
    expect(latestReleaseHeadings([STEPPERS])).toEqual([
      { depth: 2, text: "New in 0.10", id: "new-in-0-10" },
    ]);
    expect(latestReleaseHeadings([])).toEqual([]);
  });

  it("writes the newest release for the Introduction's Markdown, with links to its notes and the roadmap", () => {
    expect(latestReleaseMarkdown(STEPPERS)).toBe(
      [
        "## New in 0.10",
        "",
        "Short flows, one step at a time.",
        "",
        "- A `Stepper`.",
        "- Button shapes.",
        "",
        "[Release notes for 0.10.0](/resources/whats-new#release-0-10-0) and [what comes next](/resources/roadmap).",
      ].join("\n"),
    );
  });
});
