import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 720 } });

/** Puts the pointer in the middle of the part of the sidebar that's on screen. */
async function pointAtSidebar(page: Page, sidebar: Locator): Promise<void> {
  const box = await sidebar.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error("the sidebar isn't on screen");
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, viewport.height);
  await page.mouse.move(box.x + box.width / 2, (top + bottom) / 2);
}

test("the sidebar's whole list can be scrolled to with the pointer over it", async ({
  page,
}) => {
  await page.goto("/foundations/tokens");
  const sidebar = page.getByRole("navigation", { name: "Pages" });
  const links = sidebar.getByRole("link");
  await expect(links.first()).toBeVisible();
  await pointAtSidebar(page, sidebar);
  for (let turn = 0; turn < 20; turn += 1) await page.mouse.wheel(0, 400);
  await expect(async () => {
    const last = await links.last().boundingBox();
    const viewport = page.viewportSize();
    expect(last && viewport && last.y + last.height).toBeLessThanOrEqual(
      viewport?.height ?? 0,
    );
  }).toPass();
});

test("at the bottom of a long page, scrolling up over the sidebar reaches its first link", async ({
  page,
}) => {
  await page.goto("/foundations/tokens");
  const sidebar = page.getByRole("navigation", { name: "Pages" });
  const links = sidebar.getByRole("link");
  await expect(links.first()).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await pointAtSidebar(page, sidebar);
  for (let turn = 0; turn < 30; turn += 1) await page.mouse.wheel(0, -400);
  const header = page.locator(".pg-top");
  await expect(async () => {
    const first = await links.first().boundingBox();
    const band = await header.boundingBox();
    expect(first && band && first.y).toBeGreaterThanOrEqual(
      band ? band.y + band.height : Number.POSITIVE_INFINITY,
    );
  }).toPass();
});

test("the sidebar keeps the current page in view", async ({ page }) => {
  await page.goto("/components/sticky");
  const current = page
    .getByRole("navigation", { name: "Pages" })
    .getByRole("link", { name: "Sticky" });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(current).toBeInViewport({ ratio: 1 });
});
