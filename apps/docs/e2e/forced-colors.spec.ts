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

/** WCAG contrast between two computed `rgb(…)` colors. */
function contrast(a: string, b: string): number {
  const luminance = (color: string): number => {
    const channels = (color.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3);
    const [r = 0, g = 0, bl = 0] = channels.map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

test.beforeEach(({ browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Only Chromium emulates forced colors.",
  );
});

test("a switch keeps its edge and its thumb, off and on, enabled and disabled", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/#/switch");
  for (const name of [
    "Snap to the grid",
    "Show guides",
    "Share with the team",
    "Keep a backup",
  ]) {
    const track = page.getByRole("switch", { name, exact: true }).first();
    const thumb = track.locator('[data-bt-part="thumb"]');
    const trackPaint = await paint(track);
    const thumbPaint = await paint(thumb);
    expect(
      contrast(thumbPaint.background, trackPaint.background),
      name,
    ).toBeGreaterThanOrEqual(3);
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
