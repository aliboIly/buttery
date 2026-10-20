import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

/** Forced colors drop shadows and flatten backgrounds: these controls draw themselves in system colors there. */

async function paint(locator: Locator): Promise<{
  readonly background: string;
  readonly shadow: string;
  readonly border: string;
}> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      shadow: style.boxShadow,
      border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`,
    };
  });
}

test.beforeEach(({ browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Only Chromium emulates forced colors.",
  );
});

test("a switch keeps its edge and its thumb, off and on", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/#/switch");
  for (const name of ["Snap to the grid", "Show guides"]) {
    const track = page.getByRole("switch", { name, exact: true }).first();
    const thumb = track.locator('[data-bt-part="thumb"]');
    const trackPaint = await paint(track);
    const thumbPaint = await paint(thumb);
    expect(thumbPaint.background, name).not.toBe(trackPaint.background);
    if ((await track.getAttribute("data-state")) === "unchecked") {
      expect(trackPaint.shadow, name).not.toBe("none");
    }
  }
});

test("a checkbox keeps its edge, and its mark when ticked", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/#/checkbox");
  const box = page.getByRole("checkbox").first();
  const boxPaint = await paint(box);
  expect(boxPaint.border).toMatch(/^1px solid /);
  expect(boxPaint.border).not.toContain("rgba(0, 0, 0, 0)");
  await box.click();
  const mark = box.locator("svg");
  await expect(mark).toBeVisible();
  const stroke = await mark.evaluate(
    (element) => getComputedStyle(element).color,
  );
  expect(stroke).not.toBe((await paint(box)).background);
});
