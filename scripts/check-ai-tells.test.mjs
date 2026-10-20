import { describe, expect, it } from "vitest";
import {
  findAgentNames,
  findAttribution,
  findCommentTells,
  findCommitTells,
  findProseTells,
  findTells,
} from "./check-ai-tells.mjs";

const rules = (findings) => findings.map((finding) => finding.rule);

describe("findCommitTells", () => {
  it("accepts a conventional, imperative subject", () => {
    expect(findCommitTells("feat(core): add spacing tokens\n")).toEqual([]);
    expect(
      findCommitTells("\u{1F9C8} fix: keep toast above the toolbar"),
    ).toEqual([]);
  });

  it("rejects subjects that aren't conventional, imperative or short", () => {
    expect(rules(findCommitTells("Added tokens"))).toContain("commit-subject");
    expect(rules(findCommitTells("feat: added tokens"))).toEqual([
      "commit-subject",
    ]);
    expect(rules(findCommitTells(`docs: ${"a".repeat(70)}`))).toEqual([
      "commit-subject",
    ]);
  });

  it("rejects attribution, tool names, filler and preambles in the body", () => {
    const message = [
      "chore: tidy scripts",
      "",
      "This commit makes the checks seamless.",
      "",
      "Co-Authored-By: Claude <noreply@anthropic.com>",
    ].join("\n");
    expect(new Set(rules(findCommitTells(message)))).toEqual(
      new Set(["commit-body", "filler", "attribution", "agent-name"]),
    );
  });

  it("ignores git's comment lines, scissors and generated subjects", () => {
    const message =
      "fix: guard empty input\n# Please enter a message\n# ------------------------ >8 ------------------------\nCo-Authored-By: x";
    expect(findCommitTells(message)).toEqual([]);
    expect(findCommitTells("fixup! feat: whatever was here")).toEqual([]);
    expect(findCommitTells('Revert "feat: add tokens"')).toEqual([]);
  });
});

describe("findAttribution and findAgentNames", () => {
  it("finds attribution lines and the robot emoji", () => {
    const text =
      "Done.\n\n\u{1F916} Generated with [Claude Code](https://example.com)\n";
    expect(findAttribution(text).map((finding) => finding.line)).toEqual([
      3, 3,
    ]);
  });

  it("flags capitalized tool names but not file paths", () => {
    expect(rules(findAgentNames("Ask Gemini or an LLM about AI."))).toEqual([
      "agent-name",
      "agent-name",
      "agent-name",
    ]);
    expect(
      findAgentNames(
        "CLAUDE.md, .claude/settings.json, docs/DX_AND_AI.md, check-ai-tells",
      ),
    ).toEqual([]);
  });
});

describe("findCommentTells", () => {
  it("flags narrating, change-log, banner, emoji and unlinked TODO comments", async () => {
    const source = [
      "// This function adds two numbers",
      "// Added a fallback",
      "// ---- helpers ----",
      "// \u{1F9C8} nice",
      "// TODO: handle errors",
      "// TODO(#12): handle errors",
      "export const sum = (a: number, b: number): number => a + b;",
    ].join("\n");
    expect(rules(await findCommentTells("src/sum.ts", source))).toEqual([
      "narrating-comment",
      "changelog-comment",
      "banner-comment",
      "emoji-comment",
      "todo-comment",
    ]);
  });

  it("flags commented-out code but not JSDoc examples", async () => {
    const source = [
      "/**",
      " * Adds two numbers.",
      " * @example",
      " * const total = sum(1, 2);",
      " */",
      "export function sum(a: number, b: number): number {",
      "  // const old = a - b;",
      "  return a + b;",
      "}",
    ].join("\n");
    const findings = await findCommentTells("src/sum.ts", source);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ line: 7, rule: "commented-out-code" });
  });

  it("doesn't mistake JSX text or strings for comments", async () => {
    const source = [
      'const url = "https://example.com/a//b";',
      "export function Note() {",
      "  return <p>Don't worry // this is text, it's fine</p>;",
      "}",
    ].join("\n");
    expect(await findCommentTells("src/Note.tsx", source)).toEqual([]);
  });

  it("finishes quickly on long prose comments", async () => {
    const prose = `/* ${"Edit the token source then run the generator again. ".repeat(40)} */\n.a { color: red; }\n`;
    const started = performance.now();
    expect(await findCommentTells("src/long.css", prose)).toEqual([]);
    expect(performance.now() - started).toBeLessThan(500);
  });

  it("reads CSS comments", async () => {
    const css =
      "/* Updated colors */\n.a { color: red; }\n/* .b { color: blue; } */\n";
    expect(rules(await findCommentTells("src/a.css", css))).toEqual([
      "changelog-comment",
      "commented-out-code",
    ]);
  });
});

describe("findProseTells", () => {
  it("flags filler, dense em dashes, bold-label lists and recaps", () => {
    const prose = [
      "buttery is a robust system.",
      "",
      "It works — mostly — everywhere.",
      "",
      "- **Fast:** yes",
      "- **Small:** yes",
      "",
      "In summary, it's good.",
      "",
      "```",
      "a seamless code sample — —",
      "```",
    ].join("\n");
    expect(rules(findProseTells(prose)).sort()).toEqual(
      ["bold-label-list", "em-dash", "filler", "recap"].sort(),
    );
  });
});

describe("findTells", () => {
  it("allows tool names in agent files and attribution wording in the policy file", async () => {
    expect(
      await findTells("docs/DX_AND_AI.md", "Works with Claude Code and Codex."),
    ).toEqual([]);
    expect(
      await findTells("AGENTS.md", 'No "Generated with" lines, no \u{1F916}.'),
    ).toEqual([]);
    expect(
      rules(await findTells("docs/BRAND.md", "Made with Claude.")),
    ).toEqual(["agent-name"]);
  });
});
