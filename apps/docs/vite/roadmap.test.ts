import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  parseRoadmap,
  roadmapHeadings,
  roadmapIn,
  roadmapMarkdown,
} from "./roadmap.ts";
import { releasesIn } from "./whats-new.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));

const ROADMAP = `# Roadmap

**Now:** Phase 3.

## v0.1 — Foundation (Phases 0–1)
> Tokens and the provider.
- [x] Tokens
- [x] \`ButteryProvider\`

## v0.2 — Guardrails (Phase 2)
- [x] Layout primitives
- [ ] \`expectButtery\`

## v0.2.5 — Steppers
> A stepper for short flows.
- [ ] \`Stepper\`

## Later (ideas, not commitments)
- [x] Docs site deployed
- [ ] Figma library
`;

describe("Roadmap", () => {
  it("reads each release's version, name, phase, summary and boxes", () => {
    const { releases } = parseRoadmap(ROADMAP);
    expect(
      releases.map(({ version, title, phase }) => [version, title, phase]),
    ).toEqual([
      ["0.1.0", "Foundation", "Phases 0–1"],
      ["0.2.0", "Guardrails", "Phase 2"],
      ["0.2.5", "Steppers", ""],
    ]);
    expect(releases[0]?.summary).toBe("Tokens and the provider.");
    expect(releases[1]?.summary).toBe("");
    expect(releases[1]?.items).toEqual([
      { text: "Layout primitives", done: true },
      { text: "`expectButtery`", done: false },
    ]);
  });

  it("marks releases shipped until the first with boxes left, which is now, and plans the rest", () => {
    expect(
      parseRoadmap(ROADMAP).releases.map((release) => release.stage),
    ).toEqual(["shipped", "now", "planned"]);
  });

  it("keeps the later ideas that haven't landed", () => {
    expect(parseRoadmap(ROADMAP).later).toEqual([
      { text: "Figma library", done: false },
    ]);
  });

  it("writes the roadmap as Markdown, with shipped releases named as What's new names them", () => {
    expect(
      roadmapMarkdown(parseRoadmap(ROADMAP), [
        {
          version: "0.1.0",
          date: "2026-10-20",
          title: "The foundation",
          summary: "",
          examples: [],
          highlights: [],
          changes: [],
        },
      ]),
    ).toBe(
      [
        "## Now: 0.2.0, Guardrails",
        "",
        "1 of 2 done.",
        "",
        "- [x] Layout primitives",
        "- [ ] `expectButtery`",
        "",
        "## Next: 0.2.5, Steppers",
        "",
        "A stepper for short flows.",
        "",
        "- [ ] `Stepper`",
        "",
        "## Later",
        "",
        "Ideas, not commitments.",
        "",
        "- Figma library",
        "",
        "## Shipped",
        "",
        "- [0.1.0: The foundation](/resources/whats-new#release-0-1-0) (2026-10-20)",
      ].join("\n"),
    );
  });

  it("reads the repository's roadmap: every shipped release has release notes", () => {
    const roadmap = roadmapIn(root);
    const notes = releasesIn(root).map((release) => release.version);
    expect(roadmap.releases.length).toBeGreaterThan(0);
    for (const release of roadmap.releases.filter(
      (candidate) => candidate.stage === "shipped",
    ))
      expect(notes, release.version).toContain(release.version);
  });

  it("heads the parts the roadmap has", () => {
    expect(roadmapHeadings(parseRoadmap(ROADMAP))).toEqual([
      { depth: 2, text: "Now", id: "now" },
      { depth: 2, text: "Next", id: "next" },
      { depth: 2, text: "Later", id: "later" },
      { depth: 2, text: "Shipped", id: "shipped" },
    ]);
    expect(
      roadmapHeadings(parseRoadmap("## v0.1 — Foundation\n- [x] Tokens\n")),
    ).toEqual([{ depth: 2, text: "Shipped", id: "shipped" }]);
  });
});
