import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  changelogVersions,
  readReleases,
  releasesIn,
  releasesMarkdown,
} from "./whats-new.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));

const CHANGELOG = `# @buttery/react

## 0.10.0

### Minor Changes

- 1a2b3c4: Add the Stepper component.
- Give Button a \`shape\` prop.

### Patch Changes

- Updated dependencies [1a2b3c4]
  - @buttery/core@0.10.0

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
  it("reads every release on the site newest first, a patch release between its neighbours", () => {
    const versions = releasesIn(root).map((release) => release.version);
    expect(versions[0]).toBe("0.9.0");
    expect(versions.indexOf("0.4.5")).toBe(versions.indexOf("0.5.0") + 1);
    expect(versions.indexOf("0.4.0")).toBe(versions.indexOf("0.4.5") + 1);
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
      "---\nversion: 0.10.0\ndate: 2026-11-02\ntitle: Steppers\n---\n\n- A `Stepper`.\n- Button shapes.\n",
    );
    mkdirSync(join(folder, "react"));
    writeFileSync(
      join(folder, "react", "package.json"),
      JSON.stringify({ name: "@buttery/react" }),
    );
    writeFileSync(join(folder, "react", "CHANGELOG.md"), CHANGELOG);
    const [release] = readReleases(join(folder, "whats-new"), [
      join(folder, "react", "CHANGELOG.md"),
    ]);
    expect(release).toEqual({
      version: "0.10.0",
      date: "2026-11-02",
      title: "Steppers",
      highlights: ["A `Stepper`.", "Button shapes."],
      changes: [
        {
          packageName: "@buttery/react",
          lines: ["Add the Stepper component.", "Give Button a `shape` prop."],
        },
      ],
    });
  });

  it("writes each release as Markdown: its version and name, date, highlights and changes", () => {
    expect(
      releasesMarkdown([
        {
          version: "0.10.0",
          date: "2026-11-02",
          title: "Steppers",
          highlights: ["A `Stepper`."],
          changes: [
            {
              packageName: "@buttery/react",
              lines: ["Add the Stepper component."],
            },
          ],
        },
      ]),
    ).toBe(
      "## 0.10.0: Steppers\n\n2026-11-02\n\n- A `Stepper`.\n\n### @buttery/react\n\n- Add the Stepper component.",
    );
  });
});
