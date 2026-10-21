import "../styles/index.css";
import { afterEach, describe, expect, it } from "vitest";
import { createLayoutToolkit, runLayoutChecks } from "./checks.ts";
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
      <div data-bt="Panel" data-testid="edge" style="position: absolute; inset-inline-start: 2px; inset-block-start: 40px; inline-size: 120px; block-size: 40px; background: white"></div>
    </div>
    <section data-bt-region data-testid="region" style="display: flex; gap: 8px">
      <button type="button" data-bt="Button" data-variant="primary" style="block-size: var(--bt-h-sm)">Save</button>
      <button type="button" data-bt="Button" data-variant="primary" style="block-size: var(--bt-h-sm)">Publish</button>
    </section>
    <nav data-testid="pinned" style="position: sticky; inset-block-start: 0; block-size: 3000px">Pages</nav>
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
      <div data-bt="Panel" style="position: absolute; inset-inline-start: 8px; inset-block-start: 40px; inline-size: 120px; block-size: 40px; background: white"></div>
    </div>
    <section data-bt-region style="display: flex; gap: 8px">
      <button type="button" data-bt="Button" data-variant="secondary" style="block-size: var(--bt-h-sm)">Cancel</button>
      <button type="button" data-bt="Button" data-variant="primary" style="block-size: var(--bt-h-sm)">Save</button>
    </section>
  </main>`;

describe("runLayoutChecks", () => {
  it("passes the fixed fixture", () => {
    expect(check(FIXED)).toEqual([]);
  });

  it("fails every rule on the broken fixture, each with a message and a fix", () => {
    const violations = check(BROKEN);
    expect(rulesOf(violations)).toEqual([
      "clipping",
      "emphasis",
      "layering",
      "overflow",
      "overlap",
      "reach",
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

  it("counts primary buttons in their nearest region, leaving out hidden ones and those in no region", () => {
    const html = (inner: string): string => `
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 8px">${inner}</div>`;
    const primary = (name: string, extra = ""): string =>
      `<button type="button" data-bt="Button" data-variant="primary" style="block-size: var(--bt-h-sm)${extra}">${name}</button>`;
    expect(
      check(
        html(`
          <section data-bt-region data-testid="page">
            ${primary("New order")}
            <div data-bt-region>${primary("Save")}</div>
            ${primary("Hidden", "; display: none")}
          </section>
          ${primary("Loose")}${primary("Also loose")}`),
        ["emphasis"],
      ),
    ).toEqual([]);
    const [found] = check(
      html(
        `<div role="dialog">${primary("Delete")}${primary("Archive")}</div>`,
      ),
      ["emphasis"],
    );
    expect(found?.message).toBe(
      '2 primary buttons in one region: "Delete", "Archive"',
    );
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

  it("lets content marked data-bt-allow-overlap ride past its parent's edges, as crop handles do", () => {
    const violations = check(
      `<div data-testid="frame" style="position: relative; inline-size: 120px; block-size: 80px">
         <div data-bt-allow-overlap style="position: absolute; inset: 0">
           <span style="position: absolute; inset-inline-start: 100%; inline-size: 12px; block-size: 12px; translate: -50% 0"></span>
           <span style="position: absolute; inset-inline-start: 90%; white-space: nowrap">A title running past the edge</span>
         </div>
       </div>
       <div data-testid="plain" style="position: relative; inline-size: 120px; block-size: 80px">
         <span style="position: absolute; inset-inline-start: 100%; inline-size: 12px; block-size: 12px"></span>
       </div>`,
      ["overflow"],
    );
    expect(violations.map((violation) => violation.a)).toEqual([
      '[data-testid="plain"]',
    ]);
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

  it("holds only standalone buttons to 28, not the segments, tabs and items of a control", () => {
    const violations = check(
      `<div role="radiogroup" aria-label="Fill" style="display: flex">
         <button type="button" role="radio" aria-checked="true" style="block-size: 26px; inline-size: 64px">Solid</button>
         <button type="button" role="radio" aria-checked="false" style="block-size: 26px; inline-size: 64px">Image</button>
       </div>
       <div role="button" tabindex="0" data-testid="short" style="block-size: 26px; inline-size: 64px">Save</div>
       <button type="button" role="combobox" aria-expanded="false" data-testid="select" style="block-size: 26px; inline-size: 64px">Square</button>`,
      ["target-size"],
    );
    expect(violations.map((violation) => violation.a)).toEqual([
      '[data-testid="short"]',
      '[data-testid="select"]',
    ]);
  });

  it("doesn't flag a block inside a screen-reader-only element, such as a hidden table row's cell", () => {
    expect(
      check(
        `<div role="table" style="inline-size: 300px">
           <div role="row" style="position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap">
             <div role="cell">Loading the orders, a moment</div>
           </div>
         </div>`,
        ["overflow"],
      ),
    ).toEqual([]);
  });

  it("doesn't flag text trimmed to its cap height as overflow", () => {
    expect(
      check(
        '<p class="bt-text" data-role="title" data-bt="Text">Your canvas is empty</p>',
        ["overflow"],
      ),
    ).toEqual([]);
  });

  it("doesn't flag containers of trimmed text, but still catches real overflow in them", () => {
    expect(
      check(
        `<div data-bt="Stack" style="display: flex; flex-direction: column; gap: 12px">
           <p class="bt-text" data-role="caption" data-bt="Text">primitive</p>
           <p class="bt-text" data-role="heading-1" data-bt="Text">Stack</p>
           <p class="bt-text" data-role="body-lg" data-bt="Text">Lays children out in a column.</p>
         </div>`,
        ["overflow"],
      ),
    ).toEqual([]);
    expect(
      check(
        `<div data-bt="Card" data-testid="narrow" style="inline-size: 60px">
           <p class="bt-text" data-role="title" data-bt="Text" style="white-space: nowrap">A title that cannot wrap</p>
         </div>`,
        ["overflow"],
      ).map((violation) => violation.a),
    ).toContain('[data-bt="Text"]');
  });

  it("catches overlapping text inside one component", () => {
    const violations = check(
      `<div data-bt="Stack" style="display: flex; flex-direction: column">
         <p data-testid="first" style="margin: 0; line-height: 20px">Spring launch</p>
         <p data-testid="second" style="margin: -12px 0 0; line-height: 20px">Summer sale</p>
       </div>`,
      ["overlap"],
    );
    expect(violations).toEqual([
      expect.objectContaining({
        rule: "overlap",
        a: '[data-testid="first"]',
        b: '[data-testid="second"]',
      }),
    ]);
  });

  it("measures text a line at a time, by its line boxes", () => {
    expect(
      check(
        `<p data-bt="Text" style="inline-size: 120px; font-size: 32px; line-height: 30px">
           Every card <strong>starts</strong> on a <em>blank</em> canvas
         </p>
         <div data-bt="Inline" style="display: flex; inline-size: 200px">
           <span data-bt="Label" style="line-height: 16px">Opacity</span>
           <span data-bt="Badge" style="line-height: 16px">100%</span>
         </div>`,
        ["overlap"],
      ),
    ).toEqual([]);
  });

  it("measures trimmed text by its trimmed box", () => {
    expect(
      check(
        `<div data-bt="Stack" style="display: flex; flex-direction: column; gap: 4px">
           <p class="bt-text" data-role="label" data-bt="Text">Backdrop</p>
           <p class="bt-text" data-role="caption" data-bt="Text">Fills the canvas behind the card</p>
         </div>`,
        ["overlap"],
      ),
    ).toEqual([]);
  });

  it("sees the descenders of trimmed text hanging into the next line", () => {
    const stack = (gap: number): string =>
      `<div data-bt="Stack" style="display: flex; flex-direction: column; gap: ${String(gap)}px">
         <p class="bt-text" data-role="display" data-bt="Text" data-testid="total">1,204</p>
         <p class="bt-text" data-role="caption" data-bt="Text" data-testid="caption">cards made today</p>
       </div>`;
    const tight = check(stack(2), ["overlap"]);
    expect(tight.map((violation) => violation.rule)).toEqual(["overlap"]);
    expect([tight[0]?.a, tight[0]?.b].sort()).toEqual([
      '[data-testid="caption"]',
      '[data-testid="total"]',
    ]);
    expect(check(stack(16), ["overlap"])).toEqual([]);
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

describe("floating UI over page chrome", () => {
  const page = (noticeTop: number): string => `
    <header style="display: flex; justify-content: flex-end; padding: 16px">
      <button type="button" data-testid="settings" style="inline-size: 120px; block-size: 36px">Settings</button>
    </header>
    <div data-bt-layer="toast" style="position: fixed; inset: 0; z-index: var(--bt-z-toast); pointer-events: none">
      <div class="bt-floating-lanes" data-bt="FloatingLanes">
        <div data-bt-part="lane" style="position: absolute; inset-block-start: ${String(noticeTop)}px; inset-inline-end: 24px">
          <div data-bt="Notice" data-testid="notice" style="inline-size: 200px; block-size: 60px; background: white">Update ready</div>
        </div>
      </div>
    </div>`;

  it("reports a lane item covering a control in the header", () => {
    const violations = check(page(24), ["overlap"]);
    expect(violations).toEqual([
      expect.objectContaining({
        rule: "overlap",
        a: '[data-testid="notice"]',
        b: '[data-testid="settings"]',
      }),
    ]);
    expect(violations[0]?.message).toContain("header or navigation");
  });

  it("passes a lane item that sits below the header", () => {
    expect(check(page(84), ["overlap"])).toEqual([]);
  });
});

describe("clipping", () => {
  it("wants the full text in a title or tooltip on the text or its control", () => {
    const truncated = (attributes: string): string =>
      `<span data-bt-truncate ${attributes} style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">Remove background</span>`;
    const violations = check(
      `<div role="toolbar" aria-label="Edit" data-testid="toolbar">${truncated('data-testid="untitled"')}</div>
       ${truncated('data-testid="labelled" aria-label="Remove background"')}
       <button type="button" title="Remove background" style="block-size: 36px">${truncated('data-testid="in-button"')}</button>
       ${truncated('data-testid="titled" title="Remove background"')}`,
      ["clipping"],
    );
    expect(violations.map((violation) => violation.a).sort()).toEqual([
      '[data-testid="labelled"]',
      '[data-testid="untitled"]',
    ]);
  });

  it("catches text cut off without an ellipsis", () => {
    const [violation, ...rest] = check(
      `<div data-testid="box" style="inline-size: 60px; overflow: hidden; white-space: nowrap">
         <span data-testid="label">Remove background</span>
       </div>`,
      ["clipping"],
    );
    expect(rest).toEqual([]);
    expect(violation).toMatchObject({
      rule: "clipping",
      a: '[data-testid="label"]',
      b: '[data-testid="box"]',
    });
    expect(violation?.message).toContain("cut off");
  });

  it("leaves scrolling, declared clips and visually hidden text alone", () => {
    expect(
      check(
        `<div style="inline-size: 60px; block-size: 40px; overflow: auto; white-space: nowrap">Remove background</div>
         <div data-bt-clip style="inline-size: 60px; overflow: hidden; white-space: nowrap">Remove background</div>
         <span style="position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap">Remove background</span>
         <div style="inline-size: 200px; overflow: hidden"><h2 style="margin: 0; font-size: 48px; line-height: 44px">Studio</h2></div>`,
        ["clipping"],
      ),
    ).toEqual([]);
  });
});

describe("target size", () => {
  it("lets only links inside a sentence be small", () => {
    const violations = check(
      `<p style="font-size: 13px; line-height: 16px">Read the <a href="#guide" data-testid="sentence">export guide</a> first.</p>
       <div><a href="#close" data-testid="alone" style="font-size: 9px; line-height: 9px">Close</a></div>`,
      ["target-size"],
    );
    expect(violations.map((violation) => violation.a)).toEqual([
      '[data-testid="alone"]',
    ]);
  });

  it("doesn't count screen-reader-only focus targets, which no one can tap", () => {
    expect(
      check(
        `<span tabindex="0" style="position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap">Toasts</span>
         <button type="button" style="inline-size: 1px; block-size: 1px; padding: 0; border: 0" data-testid="tiny"></button>`,
        ["target-size"],
      ).map((violation) => violation.a),
    ).toEqual(['[data-testid="tiny"]']);
  });

  it("doesn't count tab panels or focusable scroll regions as targets", () => {
    expect(
      check(
        `<div role="tabpanel" tabindex="0" style="block-size: 10px">The card as people will see it.</div>
         <div tabindex="0" style="block-size: 12px; overflow-y: auto"><div style="block-size: 40px"></div></div>`,
        ["target-size"],
      ),
    ).toEqual([]);
  });
});

describe("reach", () => {
  it("reports a sticky box taller than the space where it sticks", () => {
    const violations = check(
      `<nav data-testid="pages" style="position: sticky; inset-block-start: 0; block-size: 3000px">Pages</nav>`,
      ["reach"],
    );
    expect(violations.map((violation) => violation.a)).toEqual([
      '[data-testid="pages"]',
    ]);
  });

  it("leaves a box that sticks only sideways alone, such as a table's first column far down the page", () => {
    expect(
      check(
        `<div style="block-size: 3000px"></div>
         <div style="overflow-x: auto; inline-size: 200px">
           <div style="display: flex; inline-size: 600px">
             <div style="position: sticky; inset-inline-start: 0; block-size: 36px; inline-size: 100px">Order</div>
             <div style="inline-size: 500px">Ines Vale</div>
           </div>
         </div>`,
        ["reach"],
      ),
    ).toEqual([]);
  });

  it("reports a contained list that stays put with its end out of view", () => {
    const violations = check(
      `<div style="block-size: 200px"></div>
       <nav data-testid="pages" style="position: sticky; inset-block-start: 0; max-block-size: 100dvh; overflow-y: auto; overscroll-behavior: contain">
         <div style="block-size: 3000px"></div>
       </nav>
       <div style="block-size: 2000px"></div>`,
      ["reach"],
    );
    expect(violations.map((violation) => violation.a)).toEqual([
      '[data-testid="pages"]',
    ]);
  });

  it("reports content centered past the start of a scroll area", () => {
    const violations = check(
      `<nav data-testid="pages" style="display: flex; align-items: center; block-size: 200px; overflow-y: auto">
         <div style="block-size: 600px">Pages</div>
       </nav>`,
      ["reach"],
    );
    expect(violations).toMatchObject([
      { rule: "reach", a: '[data-testid="pages"]', px: 200 },
    ]);
  });

  it("measures a scroll area by the boxes inside it, and lets reversed lists overflow their start", () => {
    expect(
      check(
        `<div style="block-size: 400px"></div>
         <div style="block-size: 200px; overflow-y: auto">
           <div hidden>Draft</div>
           <div style="display: none">Archived</div>
           <div style="display: contents"><p style="margin: 0">Pages</p></div>
         </div>
         <div style="display: flex; flex-direction: column-reverse; block-size: 200px; overflow-y: auto">
           <div style="flex: none; block-size: 600px">Messages</div>
         </div>
         <div style="block-size: 2000px"></div>`,
        ["reach"],
      ),
    ).toEqual([]);
  });

  it("passes an aside that fits where it sticks, and contained lists in the flow", () => {
    expect(
      check(
        `<nav style="position: sticky; inset-block-start: 0; max-block-size: 100dvh; overflow-y: auto; overscroll-behavior: contain">
           <div style="block-size: 3000px"></div>
         </nav>
         <div style="block-size: 2000px"></div>
         <div style="max-block-size: 200px; overflow-y: auto; overscroll-behavior: contain">
           <div style="block-size: 600px"></div>
         </div>`,
        ["reach"],
      ),
    ).toEqual([]);
  });
});

describe("viewport fit", () => {
  it("checks the outermost painted surface in a layer, once", () => {
    const violations = check(
      `<div data-bt-layer="modal" style="position: fixed; inset: 0; z-index: var(--bt-z-modal)">
         <div data-bt="Center" style="display: grid; place-items: center; block-size: 100%">
           <div data-bt="Surface" data-testid="dialog" style="inline-size: 120px; block-size: 80px; background: white">
             <div data-bt="Surface" style="block-size: 20px; background: gray"></div>
           </div>
         </div>
       </div>
       <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown)">
         <div data-bt="Surface" data-testid="menu" style="position: absolute; inset-inline-start: -40px; inset-block-start: 40px; inline-size: 120px; block-size: 40px; background: white">
           <div data-bt="Surface" style="block-size: 20px; background: gray"></div>
         </div>
       </div>`,
      ["viewport-fit"],
    );
    expect(violations).toEqual([
      expect.objectContaining({
        a: '[data-testid="menu"]',
        px: 48,
        message:
          "floating surface runs 40px past the viewport edge (keep it 8px inside)",
      }),
    ]);
  });
});

describe("moved", () => {
  it("reports buttery elements that shifted, once per moving group, and skips allowed ones", () => {
    document.body.innerHTML = `
      <div data-bt="Stack" style="display: flex; flex-direction: column">
        <div data-testid="spacer" style="block-size: 0"></div>
        <div data-bt="Row" data-testid="row"><span data-bt="Text">Label</span></div>
        <div data-bt="Banner" data-testid="banner">Promo</div>
        <div data-bt="Loop" data-testid="loop"><span data-bt="Dot">•</span></div>
      </div>`;
    const toolkit = createLayoutToolkit();
    toolkit.snapshot();
    document
      .querySelector<HTMLElement>('[data-testid="spacer"]')
      ?.style.setProperty("block-size", "20px");
    const shifts = toolkit.moved({
      during: "after Load more",
      allow: ['[data-testid="banner"]'],
    });
    expect(shifts).toEqual([
      expect.objectContaining({
        rule: "stability",
        a: '[data-testid="row"]',
        px: 20,
        message: "moved 0px across and 20px down after Load more",
      }),
    ]);
  });

  it("doesn't count an element that appears from no box, or goes to none, as movement", () => {
    document.body.innerHTML = `
      <div data-testid="region" style="display: none"><ol data-bt="Toaster"></ol></div>
      <div data-bt="Banner" data-testid="banner">Promo</div>`;
    const toolkit = createLayoutToolkit();
    toolkit.snapshot();
    document
      .querySelector<HTMLElement>('[data-testid="region"]')
      ?.style.setProperty("display", "block");
    document
      .querySelector<HTMLElement>('[data-testid="banner"]')
      ?.style.setProperty("display", "none");
    expect(toolkit.moved({ during: "after Show a toast" })).toEqual([]);
  });

  it("doesn't count scrolling or a stuck sticky bar as movement", () => {
    document.body.innerHTML = `
      <div data-testid="scroller" style="block-size: 200px; overflow: auto">
        <div class="bt-sticky" data-bt="Sticky" style="position: sticky; top: 0; block-size: 40px">Nav</div>
        <div data-bt="Stack" style="block-size: 2000px"><div data-bt="Row">Row</div></div>
      </div>
      <div data-bt="Footer" style="block-size: 3000px">Footer</div>`;
    const toolkit = createLayoutToolkit();
    toolkit.snapshot();
    const scroller = document.querySelector('[data-testid="scroller"]');
    scroller?.scrollTo({ top: 300 });
    window.scrollTo({ top: 120 });
    const shifts = toolkit.moved({ during: "after Scroll" });
    window.scrollTo({ top: 0 });
    expect(shifts).toEqual([]);
  });

  it("reports the layout shift, not the scroll, when both happen", () => {
    document.body.innerHTML = `
      <div data-bt="Stack" style="display: flex; flex-direction: column">
        <div data-testid="spacer" style="block-size: 0"></div>
        <div data-bt="Row" data-testid="row">Row</div>
        <div style="block-size: 3000px"></div>
      </div>`;
    const toolkit = createLayoutToolkit();
    toolkit.snapshot();
    window.scrollTo({ top: 200 });
    document
      .querySelector<HTMLElement>('[data-testid="spacer"]')
      ?.style.setProperty("block-size", "24px");
    const shifts = toolkit.moved({ during: "after Load more" });
    window.scrollTo({ top: 0 });
    expect(shifts).toEqual([
      expect.objectContaining({
        a: '[data-testid="row"]',
        message: "moved 0px across and 24px down after Load more",
      }),
    ]);
  });
});
