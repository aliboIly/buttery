import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

function headerTitle(page: Page): Locator {
  return page.locator('[data-bt="HeaderBar"] [data-bt-part="title"]');
}

/** The canvas size the inspector shows beside Size. */
function size(page: Page): Locator {
  return page
    .locator('[data-bt-part="row"]')
    .filter({ hasText: "Size" })
    .locator('[data-bt-part="value"]');
}

test("renders with the bundled font and no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(headerTitle(page)).toHaveText("Opening night");
  const interLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Inter Variable"');
  });
  expect(interLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("the inspector changes the design, and Undo and Redo walk the changes back and forth", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const title = page.getByRole("textbox", { name: "Title" });
  const canvas = page.getByRole("img", { name: /^Design preview/ });
  await title.fill("Spring fair");
  await title.blur();
  await expect(headerTitle(page)).toHaveText("Spring fair");
  await page.getByRole("radio", { name: "Square", exact: true }).click();
  await expect(size(page)).toHaveText("1440 × 1440");
  await expect(canvas).toHaveAccessibleName("Design preview: Spring fair");

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(size(page)).toHaveText("1920 × 1080");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(headerTitle(page)).toHaveText("Opening night");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(headerTitle(page)).toHaveText("Spring fair");
});

test("on a phone the inspector opens as a sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Edit design", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Design settings" }),
  ).toBeVisible();
});
