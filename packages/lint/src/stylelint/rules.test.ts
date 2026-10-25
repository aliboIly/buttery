import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import stylelint from "stylelint";
import { describe, expect, it } from "vitest";
import { butteryStylelintConfig, scanValue } from "./index.ts";
import { isSkipped } from "./known-names.ts";

const APP = "/repo/apps/demo/src/page.css";
const TOKENS = "/repo/packages/core/src/tokens/tokens.css";
const LAYER = "/repo/packages/core/src/layers/popover/popover.css";
const COMPONENT = "/repo/packages/react/src/components/slider/slider.css";

async function lint(code: string, file = APP): Promise<string[]> {
  const { results } = await stylelint.lint({
    code,
    codeFilename: file,
    config: butteryStylelintConfig(),
  });
  return (results[0]?.warnings ?? []).map((warning) => warning.rule);
}

describe("buttery/no-raw-color", () => {
  it("rejects hand-written colors outside the token files", async () => {
    expect(await lint(".a { color: #333; }")).toEqual(["buttery/no-raw-color"]);
    expect(await lint(".a { background: rgb(0 0 0 / 50%); }")).toEqual([
      "buttery/no-raw-color",
    ]);
    expect(await lint(".a { color: red; }")).toEqual(["buttery/no-raw-color"]);
    expect(await lint(".a { --bt-x: #333; }", TOKENS)).toEqual([]);
  });

  it("accepts tokens, transparent and color-mix of tokens", async () => {
    expect(
      await lint(
        ".a { color: var(--bt-text); background: color-mix(in srgb, var(--bt-accent) 8%, transparent); border-color: currentColor; }",
      ),
    ).toEqual([]);
  });
});

describe("buttery/z-index-token", () => {
  it("only allows z tokens and auto", async () => {
    expect(await lint(".a { z-index: 3; }")).toEqual(["buttery/z-index-token"]);
    expect(
      await lint(".a { z-index: var(--bt-z-modal); } .b { z-index: auto; }"),
    ).toEqual([]);
  });
});

describe("buttery/no-negative-margin", () => {
  it("rejects negative margins in any form", async () => {
    expect(await lint(".a { margin-top: -4px; }")).toContain(
      "buttery/no-negative-margin",
    );
    expect(
      await lint(".a { margin-inline: calc(var(--bt-space-2) * -1); }"),
    ).toEqual(["buttery/no-negative-margin"]);
    expect(await lint(".a { margin: 0 auto; }")).toEqual([]);
  });
});

describe("buttery/position-owned", () => {
  it("keeps out-of-flow positioning to layers and component parts", async () => {
    expect(await lint(".a { position: absolute; }")).toEqual([
      "buttery/position-owned",
    ]);
    expect(await lint(".a { position: absolute; }", LAYER)).toEqual([]);
    expect(
      await lint(
        '[data-bt="Slider"] [data-bt-part="thumb"] { position: absolute; }',
        COMPONENT,
      ),
    ).toEqual([]);
    expect(
      await lint('[data-bt="Slider"] { position: absolute; }', COMPONENT),
    ).toEqual(["buttery/position-owned"]);
    expect(await lint(".a { position: relative; }")).toEqual([]);
  });
});

describe("buttery/raw-length", () => {
  it("rejects raw lengths and durations outside the allowed places", async () => {
    expect(await lint(".a { padding: 12px; }")).toEqual(["buttery/raw-length"]);
    expect(await lint(".a { transition: color 120ms ease; }")).toEqual([
      "buttery/raw-length",
    ]);
    expect(await lint(".a { border: 3px solid var(--bt-border); }")).toEqual([
      "buttery/raw-length",
    ]);
    expect(await lint(".a { --card-gap: 12px; }")).toEqual([
      "buttery/raw-length",
    ]);
  });

  it("allows raw lengths only in the file's own variables, in its first rule", async () => {
    expect(
      await lint(
        ".bt-slider { --bt-slider-thumb: 24px; } .bt-slider-thumb { inline-size: var(--bt-slider-thumb); }",
        COMPONENT,
      ),
    ).toEqual([]);
    expect(await lint(".a { --bt-x: 13px; }")).toEqual(["buttery/raw-length"]);
    expect(
      await lint(".bt-slider { --bt-other-thumb: 24px; }", COMPONENT),
    ).toEqual(["buttery/raw-length"]);
    expect(
      await lint(
        ".bt-slider { display: flex; } .bt-slider[data-size='sm'] { --bt-slider-thumb: 20px; }",
        COMPONENT,
      ),
    ).toEqual(["buttery/raw-length"]);
    expect(
      await lint(
        "@layer bt.components { .bt-slider { --bt-slider-thumb: 24px; } }",
        COMPONENT,
      ),
    ).toEqual([]);
  });

  it("allows tokens, component variables, hairlines and fluid units", async () => {
    expect(
      await lint(
        `.a {
          --bt-page-thumb: 24px;
          padding: var(--bt-space-3) 0;
          border-block-start: 1px solid var(--bt-border);
          outline: 2px solid var(--bt-accent);
          letter-spacing: -0.01em;
          max-inline-size: 60ch;
          inline-size: min(100cqi, 100cqb * var(--bt-fitbox-ratio));
          grid-template-columns: repeat(3, minmax(0, 1fr));
          block-size: 100dvh;
          transition: color var(--bt-dur-fast) var(--bt-ease-standard);
          transform: translateX(-50%) rotate(45deg);
        }`,
      ),
    ).toEqual([]);
  });
});

describe("buttery/tailwind-tokens", () => {
  it("checks the classes an @apply pulls in", async () => {
    expect(await lint(".a { @apply flex gap-4 bg-surface; }")).toEqual([]);
    expect(await lint(".a { @apply absolute z-50 p-[13px]; }")).toEqual([
      "buttery/tailwind-tokens",
      "buttery/tailwind-tokens",
      "buttery/tailwind-tokens",
    ]);
  });
});

describe("scanValue", () => {
  it("reads functions, words, hashes and numbers with units", () => {
    expect(scanValue("calc(100% - 2px) #fff solid -0.5em 'red'")).toEqual([
      { kind: "function", name: "calc" },
      { kind: "number", value: 100, unit: "%", text: "100%" },
      { kind: "number", value: 2, unit: "px", text: "2px" },
      { kind: "hash", text: "#fff" },
      { kind: "word", text: "solid" },
      { kind: "number", value: -0.5, unit: "em", text: "-0.5em" },
    ]);
    expect(scanValue("var(--bt-space-2)")).toEqual([
      { kind: "function", name: "var" },
      { kind: "word", text: "--bt-space-2" },
    ]);
  });
});

describe("buttery/known-token", () => {
  // Built at run time, so the rule doesn't find these names in this file's own source.
  const guessed = ["--bt", "h", "md"].join("-");
  const misspelled = ["--bt", "txet"].join("-");

  it("rejects a var() of a name buttery and the project don't have, naming the nearest", async () => {
    const { results } = await stylelint.lint({
      code: `.a { block-size: var(${guessed}, 32px); color: var(${misspelled}); }`,
      codeFilename: APP,
      config: butteryStylelintConfig(),
    });
    const messages = (results[0]?.warnings ?? [])
      .filter((warning) => warning.rule === "buttery/known-token")
      .map((warning) => warning.text);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatch(
      new RegExp(
        `^${guessed} isn't one of buttery's tokens or a variable the project declares or sets\\. Use one that is, such as .*--bt-h-sm`,
      ),
    );
    expect(messages[1]).toContain("such as --bt-text,");
  });

  it("finds an app from the file it lints, and a var() reading a name in the app's script doesn't make it one", async () => {
    const app = mkdtempSync(join(tmpdir(), "buttery-known-token-"));
    const write = (path: string, text: string): void => {
      mkdirSync(dirname(join(app, path)), { recursive: true });
      writeFileSync(join(app, path), text);
    };
    try {
      write("package.json", '{ "name": "plant-shop", "private": true }');
      write(
        "node_modules/@butteryui/core/package.json",
        '{ "name": "@butteryui/core", "version": "1.0.0" }',
      );
      write(
        "node_modules/@butteryui/core/dist/styles.css",
        ":root { --bt-text: #111; --bt-h-sm: 28px; } .x { gap: var(--bt-space-9); }",
      );
      write(
        "src/App.tsx",
        `export const style = { blockSize: "var(${guessed})", ["--bt-plant-gap"]: "8px" };`,
      );
      const page = join(app, "src/page.css");
      const complaints = async (): Promise<string[]> => {
        const { results } = await stylelint.lint({
          code: `.a { block-size: var(${guessed}); gap: var(--bt-plant-gap); color: var(--bt-text); padding: var(--bt-space-9); }`,
          codeFilename: page,
          config: butteryStylelintConfig(),
        });
        return (results[0]?.warnings ?? [])
          .filter((warning) => warning.rule === "buttery/known-token")
          .map((warning) => warning.text.split(" ")[0] ?? "");
      };
      expect(await complaints()).toEqual([guessed, "--bt-space-9"]);
      write("src/sizes.css", `:root { ${guessed}: 32px; }`);
      // A name the last scan didn't have sends the rule back to the files once that scan is 250ms old.
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(await complaints()).toEqual(["--bt-space-9"]);
    } finally {
      rmSync(app, { recursive: true, force: true });
    }
  });

  it("skips builds, installs and reports in a project's paths, with either separator", () => {
    expect(isSkipped("node_modules/a/b.css")).toBe(true);
    expect(isSkipped("apps\\shop\\dist\\styles.css")).toBe(true);
    expect(isSkipped("src-tauri\\target\\debug\\a.js")).toBe(true);
    expect(isSkipped("src/distance/a.css")).toBe(false);
  });

  it("accepts tokens, buttery's own variables and the file's", async () => {
    expect(
      await lint(
        ".a { --bt-a-gap: var(--bt-space-2); gap: var(--bt-a-gap); color: var(--bt-text); min-inline-size: var(--bt-overflow-cluster-more-size); }",
      ),
    ).toEqual([]);
  });
});
