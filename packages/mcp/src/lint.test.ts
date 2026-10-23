import { mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import type { Knowledge } from "./knowledge.ts";
import { LintRequestError, filesIn, lint, resolveFrom } from "./lint.ts";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

let knowledge: Knowledge;

beforeAll(() => {
  knowledge = repoKnowledge();
});

describe("buttery_lint", () => {
  it("lints files inside the project and refuses a path or symlink out of it", () => {
    expect(filesIn(ROOT, ["packages/mcp/src/lint.ts"])).toHaveLength(1);
    expect(
      filesIn(ROOT, ["packages/mcp/src/*.test.ts"]).length,
    ).toBeGreaterThan(3);
    expect(() => filesIn(ROOT, ["../outside.ts"])).toThrow(LintRequestError);
    expect(() => filesIn(ROOT, ["packages/mcp/src/missing.ts"])).toThrow(
      /No file at/,
    );
    const project = mkdtempSync(join(tmpdir(), "buttery-lint-"));
    symlinkSync("/etc", join(project, "escape"));
    expect(() => filesIn(project, ["escape/hosts"])).toThrow(
      /outside the project/,
    );
  });

  it("finds an ESM-only package that CommonJS resolution can't", () => {
    expect(resolveFrom(ROOT, "stylelint")).toMatch(
      /stylelint[\\/]lib[\\/]index\.mjs$/,
    );
  });

  it("runs the project's stylelint on CSS, splitting each problem from its fix", async () => {
    const report = await lint(knowledge, ROOT, {
      code: ".card { color: #fff; z-index: 50; }",
      language: "css",
    });
    expect(report.summary.notes).toEqual([]);
    expect(
      report.diagnostics.map(({ rule, line }) => ({ rule, line })),
    ).toEqual([
      { rule: "buttery/no-raw-color", line: 1 },
      { rule: "buttery/z-index-token", line: 1 },
    ]);
    expect(report.diagnostics[0]?.fix).toMatch(/^Use a color token/);
    expect(report.diagnostics[1]?.fix).toMatch(/^Use var\(--bt-z-raised\)/);
  });

  it("runs the project's ESLint on its files, and says why it couldn't on a snippet", async () => {
    const files = await lint(knowledge, ROOT, {
      files: ["packages/mcp/src/project.ts"],
    });
    expect(files.summary).toEqual({
      files: 1,
      errors: 0,
      warnings: 0,
      notes: [],
    });
    const snippet = await lint(knowledge, ROOT, {
      code: 'import { Stack } from "@butteryui/core";\nexport const A = () => <Stack gap="16px" />;',
    });
    expect(snippet.diagnostics.map(({ rule }) => rule)).toEqual([
      "buttery/prop-values",
    ]);
    expect(snippet.summary.notes[0]).toMatch(
      /^ESLint didn't run on the snippet/,
    );
  }, 60_000);

  it("checks a snippet's props with no project, and says what else it would run", async () => {
    const report = await lint(knowledge, null, {
      code: 'import { Button } from "@butteryui/react";\nexport const A = () => <Button variant="primay" />;',
    });
    expect(report.diagnostics).toHaveLength(1);
    expect(report.summary.notes[0]).toMatch(/no project was found/);
    await expect(
      lint(knowledge, null, { files: ["src/App.tsx"] }),
    ).rejects.toThrow(LintRequestError);
  });
});
