import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { checkButtery, expectButtery } from "../src/index.ts";
import type { ReportedViolation } from "../src/index.ts";

const tokens = readFileSync(
  new URL("../../core/src/tokens/tokens.css", import.meta.url),
  "utf8",
);

function fixture(body: string, { settled = true } = {}): string {
  return `<!doctype html>
    <html lang="en"${settled ? " data-bt-settled" : ""}>
      <head><title>Fixture</title><style>${tokens}</style></head>
      <body style="margin: 0; font: 14px/20px sans-serif">${body}</body>
    </html>`;
}

const PANEL =
  "position: absolute; inset-block-start: 400px; inline-size: 120px; block-size: 40px; background: var(--bt-bg-floating)";

const BROKEN = fixture(`
  <main style="display: block; padding: 16px">
    <div style="position: relative; block-size: 60px">
      <div data-bt="Chip" style="position: absolute; inset-inline-start: 0; inline-size: 80px; block-size: 40px"></div>
      <div data-bt="Badge" style="position: absolute; inset-inline-start: 60px; inline-size: 80px; block-size: 40px"></div>
    </div>
    <div data-bt="Card" style="inline-size: 100px"><div style="inline-size: 300px; block-size: 10px"></div></div>
    <div data-bt="Row" style="display: flex; gap: 7px"><span>One</span><span>Two</span></div>
    <button type="button" id="tiny" style="inline-size: 16px; block-size: 16px; padding: 0">x</button>
    <button type="button" id="unnamed" style="inline-size: 40px; block-size: 40px"></button>
    <div id="raised" style="position: relative; z-index: 3">Raised by hand</div>
    <span id="clipped" style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">A label much longer than its box</span>
    <button type="button" id="load" style="block-size: 36px">Load more</button>
    <div data-bt="List" id="list"><div data-bt="Item" id="first">First row</div><div data-bt="Item">Second row</div></div>
    <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown); pointer-events: none">
      <div data-bt="Panel" style="${PANEL}; inset-inline-start: 2px"></div>
    </div>
    <nav id="pinned" style="position: sticky; inset-block-start: 0; block-size: 3000px">Pages</nav>
  </main>
  <script>
    document.getElementById("load").addEventListener("click", () => {
      const banner = document.createElement("div");
      banner.textContent = "New rows loaded";
      banner.style.blockSize = "24px";
      document.getElementById("list").prepend(banner);
    });
  </script>`);

const FIXED = fixture(`
  <main style="display: block; padding: 16px">
    <div data-bt="Row" style="display: flex; gap: 8px">
      <div data-bt="Chip" style="inline-size: 80px; block-size: 40px"></div>
      <div data-bt="Badge" style="inline-size: 80px; block-size: 40px"></div>
    </div>
    <div data-bt="Card" style="inline-size: 100px"><div style="inline-size: 100%; block-size: 10px"></div></div>
    <div data-bt="Row" style="display: flex; gap: 8px"><span>One</span><span>Two</span></div>
    <button type="button" id="tiny" aria-label="Close" style="position: relative; display: grid; place-items: center; inline-size: 16px; block-size: 16px; padding: 0; border: 0"><svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" /></svg><span data-bt-hit style="position: absolute; inset: -6px"></span></button>
    <button type="button" id="unnamed" aria-label="Add a row" style="inline-size: 40px; block-size: 40px"></button>
    <div id="raised" style="position: relative; z-index: var(--bt-z-raised)">Raised with a token</div>
    <span id="clipped" data-bt-truncate title="A label much longer than its box" style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">A label much longer than its box</span>
    <button type="button" id="load" style="block-size: 36px">Load more</button>
    <div data-bt="List" id="list" style="display: flex; flex-direction: column"><div data-bt="Item" id="first">First row</div><div data-bt="Item">Second row</div></div>
    <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown); pointer-events: none">
      <div data-bt="Panel" style="${PANEL}; inset-inline-start: 8px"></div>
    </div>
    <nav id="pinned" style="position: sticky; inset-block-start: 0; block-size: 40px">Pages</nav>
  </main>
  <script>
    document.getElementById("load").addEventListener("click", () => {
      const row = document.createElement("div");
      row.setAttribute("data-bt", "Item");
      row.textContent = "Loaded row";
      document.getElementById("list").append(row);
    });
  </script>`);

async function loadMore(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Load more" }).click();
}

async function failure(run: Promise<unknown>): Promise<Error> {
  const reason: unknown = await run.then(
    () => null,
    (error: unknown) => error,
  );
  if (!(reason instanceof Error)) throw new Error("expectButtery passed");
  return reason;
}

function isReported(value: unknown): value is ReportedViolation {
  return (
    typeof value === "object" &&
    value !== null &&
    "rule" in value &&
    "a" in value &&
    "fix" in value &&
    typeof value.fix === "string"
  );
}

function reportedViolations(): ReportedViolation[] {
  const parsed: unknown = JSON.parse(
    readFileSync(test.info().outputPath("buttery-violations.json"), "utf8"),
  );
  if (!Array.isArray(parsed) || !parsed.every(isReported))
    throw new Error("buttery-violations.json isn't a list of violations");
  return parsed;
}

test("fails each broken element under its rule, with a fix", async ({
  page,
}) => {
  await page.setContent(BROKEN);
  const error = await failure(
    expectButtery(page, {
      name: "broken",
      interactions: [{ name: "load more", run: loadMore }],
    }),
  );
  const found = reportedViolations()
    .filter((violation) => violation.rule !== "accessibility")
    .map(({ rule, a, b }) => ({ rule, a, ...(b ? { b } : {}) }));
  expect(found).toEqual(
    expect.arrayContaining([
      { rule: "overlap", a: '[data-bt="Chip"]', b: '[data-bt="Badge"]' },
      { rule: "overflow", a: '[data-bt="Card"]' },
      { rule: "scale", a: '[data-bt="Row"]' },
      { rule: "target-size", a: "#tiny" },
      { rule: "layering", a: "#raised" },
      { rule: "clipping", a: "#clipped" },
      { rule: "viewport-fit", a: '[data-bt="Panel"]' },
      { rule: "reach", a: "#pinned" },
      { rule: "stability", a: "#first" },
    ]),
  );
  expect(
    reportedViolations().some(
      (violation) =>
        violation.rule === "accessibility" && violation.a === "#unnamed",
    ),
  ).toBe(true);
  expect(
    reportedViolations().find((violation) => violation.rule === "stability"),
  ).toMatchObject({
    state: "after load more",
    message: "moved 0px across and 24px down after load more",
  });
  expect(error.message).toContain("broken at 1280x720, light, comfortable");
  expect(error.message).toContain("broken after load more at 1280x720");
  expect(
    reportedViolations().every((violation) => violation.fix.length > 20),
  ).toBe(true);
});

test("returns the same violations from checkButtery without failing, and none for a page that passes", async ({
  page,
}) => {
  await page.setContent(FIXED);
  expect(
    await checkButtery(page, {
      name: "fixed",
      interactions: [{ name: "load more", run: loadMore }],
    }),
  ).toEqual([]);
  await page.setContent(BROKEN);
  const found = await checkButtery(page, { name: "broken" });
  expect(found.map(({ rule }) => rule)).toEqual(
    expect.arrayContaining(["overlap", "overflow", "scale", "target-size"]),
  );
  expect(found.every((violation) => violation.page === "broken")).toBe(true);
});

test("passes the fixed fixture in both themes and densities", async ({
  page,
}) => {
  await page.setContent(FIXED);
  await expectButtery(page, {
    name: "fixed",
    themes: ["light", "dark"],
    densities: ["comfortable", "compact"],
    interactions: [{ name: "load more", run: loadMore }],
  });
});

test("checks the state an interaction leaves the page in", async ({ page }) => {
  await page.setContent(
    fixture(`
      <button type="button" id="open" style="block-size: 36px">Export</button>
      <script>
        document.getElementById("open").addEventListener("click", () => {
          const layer = document.createElement("div");
          layer.setAttribute("data-bt-layer", "dropdown");
          layer.style.cssText = "position: fixed; inset: 0; z-index: var(--bt-z-dropdown)";
          layer.innerHTML = '<div data-bt="Menu" style="${PANEL}; inset-inline-start: -20px"></div>';
          document.body.append(layer);
        });
      </script>`),
  );
  const error = await failure(
    expectButtery(page, {
      name: "menu",
      rules: ["viewport-fit"],
      interactions: [
        {
          name: "open the export menu",
          run: async (target) => {
            await target.getByRole("button", { name: "Export" }).click();
          },
        },
      ],
    }),
  );
  expect(error.message).toContain("menu after open the export menu at");
  expect(reportedViolations()).toEqual([
    expect.objectContaining({
      rule: "viewport-fit",
      a: '[data-bt="Menu"]',
      state: "after open the export menu",
    }),
  ]);
});

test("checks a page again once it settles when it changed during a check", async ({
  page,
}) => {
  await page.setContent(
    fixture(`
      <div data-bt="Card" id="card" style="inline-size: 100px"><div style="inline-size: 300px; block-size: 10px"></div></div>
      <script>
        let toolkit;
        let loaded = false;
        Object.defineProperty(window, "__butteryLayoutToolkit", {
          get: () => toolkit,
          set: (installed) => {
            toolkit = {
              ...installed,
              check: (options) => {
                const found = installed.check(options);
                if (!loaded) {
                  loaded = true;
                  setTimeout(() => {
                    document.getElementById("card").replaceChildren("Loaded");
                  });
                }
                return found;
              },
            };
          },
        });
      </script>`),
  );
  await expectButtery(page, { name: "loads", rules: ["overflow"] });
});

test("says how to fix a page that undoes the density it's checked in", async ({
  page,
}) => {
  await page.setContent(
    fixture(`
      <p>Settings</p>
      <script>
        new MutationObserver(() => {
          if (document.documentElement.dataset.btDensity !== "comfortable")
            document.documentElement.dataset.btDensity = "comfortable";
        }).observe(document.documentElement, { attributeFilter: ["data-bt-density"] });
      </script>`),
  );
  await expect(
    expectButtery(page, {
      name: "density",
      themes: ["dark"],
      densities: ["compact"],
    }),
  ).rejects.toThrow(
    /changed data-bt-density on <html> to "comfortable" after expectButtery set it to "compact".*Fix:/,
  );
});

test("says how to fix a page that never reports settled", async ({ page }) => {
  await page.setContent(FIXED.replace(" data-bt-settled", ""));
  await expect(
    expectButtery(page, { name: "unsettled", settleTimeout: 300 }),
  ).rejects.toThrow(
    /didn't report settled.*Fix: wrap the app in <ButteryProvider>/,
  );
});

/** A row of square buttons laid out at full size and drawn at half, marked as a preview or not. */
function scaledButtons(mark: string): string {
  return fixture(`
    <main style="display: block; padding: 16px">
      <div ${mark} style="inline-size: 200px; block-size: 40px; overflow: clip">
        <div style="display: flex; gap: 4px; inline-size: 400px; transform-origin: 0 0; scale: 0.5">
          <button type="button" aria-label="Undo" style="inline-size: var(--bt-h-sm); block-size: var(--bt-h-sm)"></button>
          <button type="button" aria-label="Redo" style="inline-size: var(--bt-h-sm); block-size: var(--bt-h-sm)"></button>
          <button type="button" aria-label="Share" style="inline-size: var(--bt-h-sm); block-size: var(--bt-h-sm)"></button>
        </div>
      </div>
    </main>`);
}

test("measures a preview drawn scaled down at the size it lays out at, axe's target size too", async ({
  page,
}) => {
  await page.setContent(scaledButtons('data-bt-preview="0.5"'));
  await expectButtery(page, { name: "preview" });
  await page.setContent(scaledButtons(""));
  await failure(expectButtery(page, { name: "drawn small" }));
  const rules = reportedViolations().map(({ rule, message }) =>
    rule === "accessibility" ? message : rule,
  );
  expect(rules).toContain("target-size");
  expect(rules.some((rule) => rule.includes("(target-size)"))).toBe(true);
});
