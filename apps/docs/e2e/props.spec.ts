import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { url } from "./routes.ts";

/** Pages whose props tables hold long names, long unions, function types and defaults with spaces. */
const PAGES = ["button", "data-table", "date-range-bar", "anchor-grid"];

/** A component page's props and fields tables, in the section its props heading opens. */
const TABLES = 'section[aria-label$=" props"] table';

/** Words in the props tables' cells before the description that are drawn on more than one line. */
async function brokenWords(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const blockOf = (node: Node): Element | null => {
      for (let at = node.parentElement; at; at = at.parentElement) {
        if (!getComputedStyle(at).display.startsWith("inline")) return at;
      }
      return null;
    };
    const runs = new Map<Element | null, Text[]>();
    const cells = document.querySelectorAll(
      'section[aria-label$=" props"] tbody td:not(:last-child)',
    );
    for (const cell of cells) {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!(node instanceof Text)) continue;
        const block = blockOf(node);
        runs.set(block, [...(runs.get(block) ?? []), node]);
      }
    }
    const broken: string[] = [];
    for (const nodes of runs.values()) {
      const text = nodes.map((node) => node.data).join("");
      const at = (offset: number): [Text, number] => {
        let left = offset;
        for (const node of nodes) {
          if (left <= node.data.length) return [node, left];
          left -= node.data.length;
        }
        throw new Error("offset past the text");
      };
      for (const match of text.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(...at(match.index));
        range.setEnd(...at(match.index + match[0].length));
        const tops = new Set(
          [...range.getClientRects()]
            .filter((rect) => rect.width > 0)
            .map((rect) => Math.round(rect.top)),
        );
        if (tops.size > 1) broken.push(match[0]);
      }
    }
    return broken;
  });
}

for (const name of PAGES) {
  test(`${name}'s props tables keep names, types and defaults whole and show code in descriptions`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url(name));
    await expect(page.locator(TABLES).first()).toBeVisible();
    expect(await brokenWords(page)).toEqual([]);
    const descriptions = page.locator(`${TABLES} tbody td:last-child`);
    await expect(descriptions.filter({ hasText: "`" })).toHaveCount(0);
    expect(
      await descriptions.locator("code").count(),
      "a description's `code` shows as code",
    ).toBeGreaterThan(0);
  });
}

test("on a phone a props table scrolls sideways instead of squeezing its descriptions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url("button"));
  const table = page.locator(TABLES).first();
  await expect(table).toBeAttached();
  const { scrolls, description } = await table.evaluate((element) => ({
    scrolls:
      element.parentElement !== null &&
      element.parentElement.scrollWidth > element.parentElement.clientWidth + 1,
    description:
      element.querySelector("thead th:last-child")?.getBoundingClientRect()
        .width ?? 0,
  }));
  expect(scrolls).toBe(true);
  expect(description).toBeGreaterThanOrEqual(200);
  expect(await brokenWords(page)).toEqual([]);
});
