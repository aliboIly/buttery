import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { missingTargets, publishedTargets } from "./check-packages.mjs";

let dir = "";

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

function fixture(manifest, files) {
  dir = mkdtempSync(join(tmpdir(), "check-packages-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest));
  for (const file of files) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    writeFileSync(join(dir, file), "");
  }
  return dir;
}

describe("publishedTargets", () => {
  it("collects every export target and bin, but not the source condition", () => {
    expect(
      publishedTargets({
        exports: {
          ".": {
            "@butteryui/source": "./src/index.ts",
            types: "./dist/index.d.ts",
            default: "./dist/index.js",
          },
          "./styles.css": "./dist/styles.css",
        },
        bin: { "buttery-mcp": "dist/index.js" },
      }),
    ).toEqual([
      "./dist/index.d.ts",
      "./dist/index.js",
      "./dist/styles.css",
      "dist/index.js",
    ]);
  });
});

describe("missingTargets", () => {
  it("counts a pattern as built when it matches a file, such as a docs page", () => {
    const manifest = {
      name: "@butteryui/core",
      exports: { "./dist/docs/*": "./dist/docs/*" },
    };
    expect(
      missingTargets(fixture(manifest, ["dist/docs/components/button.md"])),
    ).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
    expect(missingTargets(fixture(manifest, ["dist/index.js"]))).toEqual([
      "@butteryui/core: ./dist/docs/*",
    ]);
  });

  it("names the targets the build didn't write, such as .js when it wrote .mjs", () => {
    const root = fixture(
      {
        name: "@butteryui/lint",
        exports: {
          "./eslint": {
            types: "./dist/eslint.d.ts",
            default: "./dist/eslint.js",
          },
        },
      },
      ["dist/eslint.d.mts", "dist/eslint.mjs"],
    );
    expect(missingTargets(root)).toEqual([
      "@butteryui/lint: ./dist/eslint.d.ts",
      "@butteryui/lint: ./dist/eslint.js",
    ]);
  });

  it("passes a package whose targets were all built, and skips a private one", () => {
    expect(
      missingTargets(
        fixture(
          { name: "@butteryui/test", exports: { ".": "./dist/index.js" } },
          ["dist/index.js"],
        ),
      ),
    ).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
    expect(
      missingTargets(
        fixture({ name: "docs", private: true, exports: "./missing.js" }, []),
      ),
    ).toEqual([]);
  });
});
