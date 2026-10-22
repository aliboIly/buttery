import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

function headerTitle(page: Page): Locator {
  return page.locator('[data-bt="HeaderBar"] [data-bt-part="title"]');
}

test("opens on the sample deck with the bundled font and no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page.getByTestId("stage-slide")).toContainText(
    "Halfmoon Roastery for your café",
  );
  await expect(headerTitle(page)).toHaveText("Halfmoon for cafés");
  await expect(page.getByRole("option")).toHaveCount(6);
  const interLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Inter Variable"');
  });
  expect(interLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("a title written in the inspector reaches the stage and the strip, and a new slide undoes away", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const title = page.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Halfmoon for your counter");
  await title.blur();
  await expect(page.getByTestId("stage-slide")).toContainText(
    "Halfmoon for your counter",
  );
  await expect(
    page.getByRole("option", { name: "Slide 1: Halfmoon for your counter" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "New slide", exact: true }).click();
  await page.getByRole("menuitem", { name: "Big numbers" }).click();
  await expect(page.getByRole("option")).toHaveCount(7);
  await expect(
    page.getByRole("option", { name: "Slide 2: By the numbers" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("stage-slide")).toContainText("40%");

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("option")).toHaveCount(6);
  await expect(
    page.getByRole("option", { name: "Slide 1: Halfmoon for your counter" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("on a phone the inspector opens as a sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Edit slide", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Slide settings" }),
  ).toBeVisible();
});
