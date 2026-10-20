import stylelint from "stylelint";
import { describe, expect, it } from "vitest";
import { butteryStylelintConfig, scanValue } from "./index.ts";

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

  it("allows tokens, component variables, hairlines and fluid units", async () => {
    expect(
      await lint(
        `.a {
          --bt-slider-thumb: 24px;
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
