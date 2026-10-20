import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { expectButtery } from "../src/index.ts";

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

const BROKEN = fixture(`
  <main style="display: block; padding: 16px">
    <div style="position: relative; block-size: 60px">
      <div data-bt="Chip" style="position: absolute; inset-inline-start: 0; inline-size: 80px; block-size: 40px"></div>
      <div data-bt="Badge" style="position: absolute; inset-inline-start: 60px; inline-size: 80px; block-size: 40px"></div>
    </div>
    <div data-bt="Card" style="inline-size: 100px"><div style="inline-size: 300px; block-size: 10px"></div></div>
    <div data-bt="Row" style="display: flex; gap: 7px"><span>One</span><span>Two</span></div>
    <button type="button" style="inline-size: 16px; block-size: 16px; padding: 0">x</button>
    <button type="button" style="inline-size: 40px; block-size: 40px"></button>
    <div style="position: relative; z-index: 3">Raised by hand</div>
    <span style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">A label much longer than its box</span>
    <button type="button" id="load" style="block-size: 36px">Load more</button>
    <div data-bt="List" id="list"><div data-bt="Item">First row</div><div data-bt="Item">Second row</div></div>
    <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown); pointer-events: none">
      <div data-bt="Panel" style="position: absolute; inset-inline-start: 2px; inset-block-start: 400px; inline-size: 120px; block-size: 40px"></div>
    </div>
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
    <button type="button" style="block-size: var(--bt-h-sm)">Save</button>
    <span data-bt-truncate title="A label much longer than its box" style="display: block; inline-size: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">A label much longer than its box</span>
    <button type="button" id="load" style="block-size: 36px">Load more</button>
    <div data-bt="List" id="list" style="display: flex; flex-direction: column"><div data-bt="Item">First row</div></div>
    <div data-bt-layer="dropdown" style="position: fixed; inset: 0; z-index: var(--bt-z-dropdown); pointer-events: none">
      <div data-bt="Panel" style="position: absolute; inset-inline-start: 8px; inset-block-start: 400px; inline-size: 120px; block-size: 40px"></div>
    </div>
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

test("fails every rule on the broken fixture, with a fix for each", async ({
  page,
}) => {
  await page.setContent(BROKEN);
  const error = await expectButtery(page, {
    name: "broken",
    interactions: [{ name: "Load more", run: loadMore }],
  }).then(
    () => null,
    (reason: unknown) => (reason instanceof Error ? reason : null),
  );
  expect(error).not.toBeNull();
  const report = error?.message ?? "";
  for (const rule of [
    "overlap",
    "overflow",
    "clipping",
    "scale",
    "target-size",
    "viewport-fit",
    "layering",
    "accessibility",
    "stability",
  ]) {
    expect(report, `the report should include ${rule}`).toContain(`  ${rule}`);
  }
  expect(report).toContain("broken at 1280x720, light, comfortable");
  expect(report).toContain('[data-bt="Chip"] and [data-bt="Badge"]');
  expect(report).toContain("moved 0px across and 24px down after Load more");
  expect(report.match(/Fix: /g)?.length).toBeGreaterThanOrEqual(9);
});

test("passes the fixed fixture in both themes and densities", async ({
  page,
}) => {
  await page.setContent(FIXED);
  await expectButtery(page, {
    name: "fixed",
    themes: ["light", "dark"],
    densities: ["comfortable", "compact"],
    interactions: [{ name: "Load more", run: loadMore }],
  });
});

test("says how to fix a page that never reports settled", async ({ page }) => {
  await page.setContent(FIXED.replace(" data-bt-settled", ""));
  await expect(
    expectButtery(page, { name: "unsettled", settleTimeout: 300 }),
  ).rejects.toThrow(
    /didn't report settled.*Fix: wrap the app in <ButteryProvider>/,
  );
});
