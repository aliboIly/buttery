import "../styles/index.css";
import { afterEach, describe, expect, it } from "vitest";
import { runLayoutChecks } from "./checks.ts";
import type { LayoutRule, LayoutViolation } from "./checks.ts";
import { layoutCheckTokens } from "./tokens.ts";

const tokens = layoutCheckTokens();

function check(html: string, rules?: readonly LayoutRule[]): LayoutViolation[] {
  document.body.innerHTML = html;
  return runLayoutChecks({ tokens, rules });
}

function rulesOf(violations: readonly LayoutViolation[]): string[] {
  return [...new Set(violations.map((violation) => violation.rule))].sort();
}

afterEach(() => {
  document.body.innerHTML = "";
});

const BROKEN = `
  <main style="display: block; padding: 16px">
    <div data-testid="overlap" style="position: relative; block-size: 60px">
      <div data-bt="Chip" style="position: absolute; inset-inline-start: 0; inline-size: 80px; block-size: 40px"></div>
      <div data-bt="Badge" style="position: absolute; inset-inline-start: 60px; inline-size: 80px; block-size: 40px"></div>
    </div>
    <div data-bt="Card" data-testid="overflow" style="inline-size: 100px">
      <div style="inline-size: 300px; block-size: 10px"></div>
    </div>
    <div data-bt="Row" data-testid="gap" style="display: flex; gap: 7px; padding: 5px">
      <span>One</span><span>Two</span>
    </div>
    <div data-bt="Control" data-bt-control data-testid="height" style="block-size: 33px"></div>
    <button type="button" data-testid="tiny" style="inline-size: 16px; block-size: 16px; padding: 0">x</button>
    <button type="button" data-testid="short" style="inline-size: 80px; block-size: 24px">Save</button>
    <div data-testid="z" style="position: relative; z-index: 3">Raised by hand</div>
    <span data-testid="clipped" style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">A label much longer than its box</span>
    <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown)">
      <div data-bt="Panel" data-testid="edge" style="position: absolute; inset-inline-start: 2px; inset-block-start: 40px; inline-size: 120px; block-size: 40px"></div>
    </div>
  </main>`;

const FIXED = `
  <main style="display: block; padding: 16px">
    <div data-bt="Row" style="display: flex; gap: 8px; padding: 4px">
      <div data-bt="Chip" style="inline-size: 80px; block-size: 40px"></div>
      <div data-bt="Badge" style="inline-size: 80px; block-size: 40px"></div>
    </div>
    <div data-bt="Card" style="inline-size: 100px">
      <div style="inline-size: 100%; block-size: 10px"></div>
    </div>
    <div data-bt="Control" data-bt-control style="block-size: var(--bt-h-control)"></div>
    <button type="button" style="inline-size: 16px; block-size: 16px; padding: 0; position: relative" aria-label="Close">
      <span data-bt-hit style="position: absolute; inset: -6px"></span>
    </button>
    <button type="button" style="inline-size: 80px; block-size: var(--bt-h-sm)">Save</button>
    <div style="position: relative; z-index: var(--bt-z-raised)">Raised with a token</div>
    <span data-bt-truncate title="A label much longer than its box" style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">A label much longer than its box</span>
    <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown)">
      <div data-bt="Panel" style="position: absolute; inset-inline-start: 8px; inset-block-start: 40px; inline-size: 120px; block-size: 40px"></div>
    </div>
  </main>`;

describe("runLayoutChecks", () => {
  it("passes the fixed fixture", () => {
    expect(check(FIXED)).toEqual([]);
  });

  it("fails every rule on the broken fixture, each with a message and a fix", () => {
    const violations = check(BROKEN);
    expect(rulesOf(violations)).toEqual([
      "clipping",
      "layering",
      "overflow",
      "overlap",
      "scale",
      "target-size",
      "viewport-fit",
    ]);
    for (const violation of violations) {
      expect(violation.message.length).toBeGreaterThan(10);
      expect(violation.fix.length).toBeGreaterThan(20);
      expect(violation.a.length).toBeGreaterThan(0);
    }
  });

  it("names both elements and the overlap in px", () => {
    const [overlap] = check(BROKEN, ["overlap"]);
    expect(overlap).toMatchObject({
      rule: "overlap",
      a: '[data-bt="Chip"]',
      b: '[data-bt="Badge"]',
      px: 20,
    });
  });

  it("reports the deepest overflowing element and sideways page scroll", () => {
    const violations = check(BROKEN, ["overflow"]);
    expect(violations.map((violation) => violation.a)).toContain(
      '[data-testid="overflow"]',
    );
    expect(
      violations.find((violation) => violation.a === '[data-testid="overflow"]')
        ?.px,
    ).toBe(200);
  });

  it("suggests the nearest steps for off-scale spacing and control heights", () => {
    const violations = check(BROKEN, ["scale"]);
    const gap = violations.find((violation) =>
      violation.message.startsWith("column-gap"),
    );
    expect(gap?.fix).toContain("Nearest: 6px or 8px");
    expect(
      violations.some((violation) =>
        violation.message.startsWith("padding-top is 5px"),
      ),
    ).toBe(true);
    expect(
      violations.some((violation) => violation.message.includes("33px tall")),
    ).toBe(true);
  });

  it("tells tiny targets from short standalone buttons", () => {
    const violations = check(BROKEN, ["target-size"]);
    expect(
      violations.find((violation) => violation.a === '[data-testid="tiny"]')
        ?.message,
    ).toContain("under 24 × 24");
    expect(
      violations.find((violation) => violation.a === '[data-testid="short"]')
        ?.message,
    ).toContain("under 28");
  });

  it("doesn't flag text trimmed to its cap height as overflow", () => {
    expect(
      check(
        '<p class="bt-text" data-role="title" data-bt="Text">Your canvas is empty</p>',
        ["overflow"],
      ),
    ).toEqual([]);
  });

  it("ignores overlaps inside a component, inside data-bt-allow-overlap, and across layers", () => {
    expect(
      check(
        `<div data-bt="Slider" style="position: relative; inline-size: 160px; block-size: 24px">
           <span data-bt-part="track" style="position: absolute; inset: 5px 0"></span>
           <span data-bt-part="thumb" style="position: absolute; inset-inline-start: 40px; inline-size: 24px; block-size: 24px"></span>
         </div>
         <div data-bt-allow-overlap style="position: relative; block-size: 40px">
           <div data-bt="Art" style="position: absolute; inset: 0"></div>
           <div data-bt="Close" style="position: absolute; inset-block-start: 4px; inset-inline-end: 4px; inline-size: 28px; block-size: 28px"></div>
         </div>
         <div data-bt="Page" style="block-size: 200px"></div>
         <div data-bt-layer="modal" style="position: fixed; inset: 0; z-index: var(--bt-z-modal)">
           <div data-bt="Dialog" style="position: absolute; inset: 40px; block-size: 80px"></div>
         </div>`,
        ["overlap"],
      ),
    ).toEqual([]);
  });
});
